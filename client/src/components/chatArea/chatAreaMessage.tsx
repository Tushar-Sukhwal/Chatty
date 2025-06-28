import React, { useState } from "react";
import { Message } from "@/types/types";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, MoreVertical, Trash2, Reply } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SocketService from "@/services/socketService";

type Props = {
  message: Message;
  isReplying: boolean;
  setIsReplying: (isReplying: boolean) => void;
  replyToMessage: Message | null;
  setReplyToMessage: (replyToMessage: Message | null) => void;
  scrollToMessage: (messageId: string) => void;
  messageRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  highlightedMessageId: string | null;
};

const ChatAreaMessage = ({
  message,
  isReplying,
  setIsReplying,
  replyToMessage,
  setReplyToMessage,
  scrollToMessage,
  messageRefs,
  highlightedMessageId,
}: Props) => {
  const { user } = useUserStore();
  const isOwnMessage = message.senderId === user?._id;
  const { activeChat, messages } = useChatStore();
  const isGroupChat = activeChat?.type === "group";

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const socketService = SocketService.getInstance();

  // Find the original message if this is a reply
  const originalMessage = message.replyTo
    ? messages.find((msg) => msg.messageId === message.replyTo)
    : null;

  // Get sender's name for group chats
  const getSenderName = (senderId?: string) => {
    const targetId = senderId || message.senderId;
    if (targetId === user?._id) return "You";
    if (!isGroupChat || !user?.friends) return "";

    const sender = user.friends.find((friend) => friend._id === targetId);
    return sender?.name || "Unknown User";
  };

  const senderName = getSenderName();

  // Handle double click to reply (only for non-deleted messages)
  const handleDoubleClick = () => {
    if (!message.deletedForEveryone) {
      setReplyToMessage(message);
      setIsReplying(true);
    }
  };

  // Handle reply action from dropdown (only for non-deleted messages)
  const handleReply = () => {
    if (!message.deletedForEveryone) {
      setReplyToMessage(message);
      setIsReplying(true);
    }
    setIsDropdownOpen(false);
  };

  // Handle clicking on replied message preview to scroll to original
  const handleRepliedMessageClick = () => {
    if (originalMessage?.messageId) {
      scrollToMessage(originalMessage.messageId);
    }
  };

  const handleMessageEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setIsDropdownOpen(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() === "" || editContent === message.content) {
      setIsEditing(false);
      setEditContent(message.content);
      return;
    }

    if (message.messageId) {
      const success = socketService.editMessage(
        message.messageId,
        editContent.trim()
      );
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleMessageDelete = () => {
    setIsDropdownOpen(false);
    setShowDeleteDialog(true);
  };

  const confirmMessageDelete = async () => {
    if (message.messageId) {
      try {
        await socketService.deleteMessage(message.messageId);
        setShowDeleteDialog(false);
      } catch (error) {
        console.error("Failed to delete message:", error);
        // You could show a toast notification here
        setShowDeleteDialog(false);
      }
    }
  };

  // Format timestamp like WhatsApp
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time only
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      // Yesterday
      return "Yesterday";
    } else if (diffInDays < 7) {
      // This week - show day name
      return date.toLocaleDateString([], { weekday: "long" });
    } else {
      // Older - show date
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div
      ref={(el) => {
        if (message.messageId) {
          messageRefs.current[message.messageId] = el;
        }
      }}
      className="flex w-full mb-1 group"
    >
      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-xs lg:max-w-md",
          isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
        )}
      >
        <div
          className={cn(
            "relative px-3 py-2 rounded-lg break-words shadow-sm cursor-pointer transition-all duration-300",
            isOwnMessage
              ? "bg-[#dcf8c6] dark:bg-primary/20 text-gray-900 dark:text-foreground rounded-br-sm"
              : "bg-white dark:bg-card text-gray-900 dark:text-foreground rounded-bl-sm border border-gray-100 dark:border-border",
            highlightedMessageId === message.messageId &&
              "ring-2 ring-blue-400 dark:ring-primary ring-opacity-75 shadow-lg scale-[1.02]"
          )}
          onDoubleClick={handleDoubleClick}
        >
          {/* Show sender name for group chats */}
          {isGroupChat && !isOwnMessage && senderName && (
            <p className="text-xs font-semibold mb-1 text-blue-600 dark:text-primary">
              {senderName}
            </p>
          )}

          {/* Show replied message if this is a reply */}
          {originalMessage && (
            <div
              className="mb-2 p-2 bg-gray-100 dark:bg-muted rounded border-l-4 border-blue-500 dark:border-primary cursor-pointer hover:bg-gray-200 dark:hover:bg-muted/80 transition-colors"
              onClick={handleRepliedMessageClick}
            >
              <div className="flex items-center gap-1 mb-1">
                <Reply className="h-3 w-3 text-blue-500 dark:text-primary" />
                <span className="text-xs font-medium text-blue-600 dark:text-primary">
                  {getSenderName(originalMessage.senderId)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-muted-foreground line-clamp-2">
                {originalMessage.deletedForEveryone
                  ? "🗑️ This message was deleted"
                  : originalMessage.content}
              </p>
            </div>
          )}

          {/* Edit mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm border-none p-0 focus-visible:ring-0 shadow-none bg-transparent text-gray-900 dark:text-foreground"
                autoFocus
              />
              <div className="flex gap-1 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveEdit}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
                  disabled={
                    editContent.trim() === "" || editContent === message.content
                  }
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            /* Normal message display */
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                {message.deletedForEveryone ? (
                  <p className="text-sm leading-relaxed italic text-gray-500 dark:text-muted-foreground">
                    🗑️ This message was deleted
                  </p>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
                      {message.content}
                    </p>
                    {message.isEdited && (
                      <span className="text-xs text-gray-500 dark:text-muted-foreground italic">
                        edited
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Message actions dropdown - only show for non-deleted messages */}
              {!message.deletedForEveryone && (
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={handleReply}>
                      <Reply className="h-3 w-3 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    {isOwnMessage && (
                      <>
                        <DropdownMenuItem onClick={handleMessageEdit}>
                          <Edit2 className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleMessageDelete}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Timestamp and status indicators */}
          {!isEditing && message.createdAt && (
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-xs text-gray-500 dark:text-muted-foreground select-none">
                {formatTimestamp(message.createdAt)}
              </span>
              {isOwnMessage && (
                <div className="flex">
                  {/* Double checkmark for delivered/read status */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="text-gray-400 dark:text-muted-foreground"
                    fill="currentColor"
                  >
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.465c.143.14.361.125.484-.033L10.907 3.879a.366.366 0 0 0-.064-.512z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-foreground">
              Delete Message
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 dark:text-muted-foreground leading-relaxed">
              Are you sure you want to delete this message?
              <br />
              <span className="font-medium text-gray-800 dark:text-foreground">
                This action cannot be undone and the message will be deleted for
                everyone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMessageDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white dark:text-white border-0 font-medium [&>*]:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2 text-white" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatAreaMessage;
