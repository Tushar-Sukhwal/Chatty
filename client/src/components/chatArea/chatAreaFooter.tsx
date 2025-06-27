import React, { useState } from "react";
import { Button } from "../ui/button";
import { Smile, Paperclip, Camera, Send, Plus, X, Reply } from "lucide-react";
import { Input } from "../ui/input";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import SocketService from "@/services/socketService";
import { Message } from "@/types/types";

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

  // Handle form submit
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "" || !activeChat || !user) return;

    const messagePayload = {
      content: message,
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
      ...(replyToMessage && { replyTo: replyToMessage.messageId }),
    };

    const messageId = await socketService.sendMessage(messagePayload);

    // Create new message object
    const newMessage = {
      messageId: messageId,
      content: message.trim(),
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
      ...(replyToMessage && { replyTo: replyToMessage.messageId }),
    };

    // Add message to the store (this will trigger the scroll in ChatArea)
    setMessages([...messages, newMessage]);

    // Clear the input and reply state
    setMessage("");
    handleCancelReply();
  };

  return (
    <div className="border-t border-gray-200 bg-white flex-shrink-0">
      {/* Reply Preview */}
      {isReplying && replyToMessage && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Reply className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">
                  Replying to {getReplyMessageSender()}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 pl-4 border-l-2 border-blue-500">
                {replyToMessage.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
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
              <Input
                placeholder={
                  isReplying ? "Reply to message..." : "Type a message..."
                }
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[2.5rem]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 flex-shrink-0"
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
                className="text-gray-500 hover:text-gray-700 h-8"
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
                className="text-gray-500 hover:text-gray-700 h-8"
                onClick={() => {
                  /* TODO: Add file attachment */
                }}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8"
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
              className="text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder={
                isReplying ? "Reply to message..." : "Type a message..."
              }
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatAreaFooter;
