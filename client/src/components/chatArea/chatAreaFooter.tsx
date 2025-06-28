import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Smile, Paperclip, Camera, Send, Plus, X, Reply } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import SocketService from "@/services/socketService";
import { Message } from "@/types/types";
import FileUpload from "./fileUpload";
import { FileUploadResponse } from "@/api/messageApi";
import { toast } from "sonner";

const ChatAreaFooter = ({
  isReplying,
  setIsReplying,
  replyToMessage,
  setReplyToMessage,
}: {
  isReplying: boolean;
  setIsReplying: (isReplying: boolean) => void;
  replyToMessage: Message | null;
  setReplyToMessage: (replyToMessage: Message | null) => void;
}) => {
  const { activeChat, setMessages, messages } = useChatStore();
  const { user } = useUserStore();
  const [message, setMessage] = useState("");
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~6 lines
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Auto-resize when message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  // Auto-resize on component mount
  useEffect(() => {
    autoResizeTextarea();
  }, []);

  const socketService = SocketService.getInstance();

  // Get sender's name for reply preview
  const getReplyMessageSender = () => {
    if (!replyToMessage || !user) return "";
    if (replyToMessage.senderId === user._id) return "You";

    const sender = user.friends?.find(
      (friend) => friend._id === replyToMessage.senderId
    );
    return sender?.name || "Unknown User";
  };

  // Cancel reply
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyToMessage(null);
  };

  // Handle file upload from drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setPastedFile(files[0]); // Set the dropped file as pasted file
      setShowFileUpload(true);
    }
  }, []);

  // Handle paste event for files
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const fileItem = items.find((item) => item.kind === "file");

    if (fileItem) {
      e.preventDefault();
      const file = fileItem.getAsFile();
      if (file) {
        setPastedFile(file);
        setShowFileUpload(true);
      }
    }
  }, []);

  // Handle file selection from upload modal
  const handleFileSelect = async (fileData: FileUploadResponse["data"]) => {
    if (!activeChat || !user) return;

    try {
      const messagePayload = {
        content: fileData.file.originalName,
        chatId: activeChat._id,
        senderId: user._id,
        createdAt: new Date(),
        type: fileData.type as "image" | "video" | "document" | "audio",
        file: fileData.file,
        ...(replyToMessage && { replyTo: replyToMessage.messageId }),
      };

      const messageId = await socketService.sendMessage(messagePayload);

      // Create new message object
      const newMessage = {
        messageId: messageId,
        content: fileData.file.originalName,
        chatId: activeChat._id,
        senderId: user._id,
        createdAt: new Date(),
        type: fileData.type as "image" | "video" | "document" | "audio",
        file: fileData.file,
        ...(replyToMessage && { replyTo: replyToMessage.messageId }),
      };

      // Add message to the store
      setMessages([...messages, newMessage]);

      // Clear reply state and close upload modal
      handleCancelReply();
      setShowFileUpload(false);
      setPastedFile(null); // Clear pasted file after successful upload

      toast.success("File sent successfully!");
    } catch (error) {
      console.error("Error sending file:", error);
      toast.error("Failed to send file. Please try again.");
    }
  };

  // Handle form submit for text messages
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "" || !activeChat || !user) return;

    const messagePayload = {
      content: message,
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
      type: "text" as const,
      ...(replyToMessage && { replyToMessageId: replyToMessage.messageId }),
    };

    const messageId = await socketService.sendMessage(messagePayload);

    // Create new message object
    const newMessage = {
      messageId: messageId,
      content: message.trim(),
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
      type: "text" as const,
      ...(replyToMessage && { replyTo: replyToMessage.messageId }),
    };

    // Add message to the store (this will trigger the scroll in ChatArea)
    setMessages([...messages, newMessage]);

    // Clear the input and reply state
    setMessage("");
    handleCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleFileButtonClick = () => {
    setPastedFile(null); // Clear any previously pasted file
    setShowFileUpload(true);
  };

  const handleFileUploadCancel = () => {
    setShowFileUpload(false);
    setPastedFile(null); // Clear pasted file when modal is closed
  };

  return (
    <div
      className={`border-t border-gray-200 dark:border-border bg-white dark:bg-card flex-shrink-0 ${
        isDragOver ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Reply Preview */}
      {isReplying && replyToMessage && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-muted border-b border-gray-200 dark:border-border">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Reply className="h-3 w-3 text-blue-500 dark:text-primary" />
                <span className="text-xs font-medium text-blue-600 dark:text-primary">
                  Replying to {getReplyMessageSender()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-2 pl-4 border-l-2 border-blue-500 dark:border-primary">
                {replyToMessage.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage}>
        <div className="p-3 md:p-4">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-end gap-2 mb-2">
              <Textarea
                placeholder={
                  isReplying ? "Reply to message..." : "Type a message..."
                }
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[2.5rem] max-h-[120px] resize-none overflow-y-auto"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                ref={textareaRef}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground h-10 w-10 flex-shrink-0"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Action Buttons Row */}
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground h-8"
                onClick={() => {
                  /* TODO: Add emoji picker */
                }}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground h-8"
                onClick={handleFileButtonClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground h-8"
                onClick={() => {
                  /* TODO: Add camera */
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
              onClick={handleFileButtonClick}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              placeholder={
                isReplying ? "Reply to message..." : "Type a message..."
              }
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-border dark:focus:border-primary dark:focus:ring-primary min-h-[2.5rem] max-h-[120px] resize-none overflow-y-auto"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              ref={textareaRef}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onFileSelect={handleFileSelect}
        onCancel={handleFileUploadCancel}
        preSelectedFile={pastedFile}
      />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-card p-4 rounded-lg shadow-lg">
            <p className="text-blue-600 dark:text-primary font-medium">
              Drop files here to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAreaFooter;
