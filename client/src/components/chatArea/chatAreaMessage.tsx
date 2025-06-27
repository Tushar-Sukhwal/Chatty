import React, { useState } from "react";
import { Message } from "@/types/types";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SocketService from "@/services/socketService";

type Props = {
  message: Message;
  isReplying: boolean;
  setIsReplying: (isReplying: boolean) => void;
  replyToMessage: Message | null;
  setReplyToMessage: (replyToMessage: Message | null) => void;
};

const ChatAreaMessage = ({
  message,
  isReplying,
  setIsReplying,
  replyToMessage,
  setReplyToMessage,
}: Props) => {
  const { user } = useUserStore();
  const isOwnMessage = message.senderId === user?._id;
  const { activeChat } = useChatStore();
  const isGroupChat = activeChat?.type === "group";

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const socketService = SocketService.getInstance();

  // Get sender's name for group chats
  const getSenderName = () => {
    if (isOwnMessage) return "You";
    if (!isGroupChat || !user?.friends) return "";

    const sender = user.friends.find(
      (friend) => friend._id === message.senderId
    );
    return sender?.name || "Unknown User";
  };

  const senderName = getSenderName();

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
    // TODO: Implement delete functionality
    setIsDropdownOpen(false);
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
    <div className="flex w-full mb-1 group">
      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-xs lg:max-w-md",
          isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
        )}
      >
        <div
          className={cn(
            "relative px-3 py-2 rounded-lg break-words shadow-sm",
            isOwnMessage
              ? "bg-[#dcf8c6] text-gray-900 rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
          )}
        >
          {/* Show sender name for group chats */}
          {isGroupChat && !isOwnMessage && senderName && (
            <p className="text-xs font-semibold mb-1 text-blue-600">
              {senderName}
            </p>
          )}

          {/* Edit mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm border-none p-0 focus-visible:ring-0 shadow-none bg-transparent"
                autoFocus
              />
              <div className="flex gap-1 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveEdit}
                  className="h-6 w-6 p-0"
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
              <div className="flex-1">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.isEdited && (
                  <span className="text-xs text-gray-500 italic">edited</span>
                )}
              </div>

              {/* Message actions for own messages */}
              {isOwnMessage && (
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={handleMessageEdit}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleMessageDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Timestamp and status indicators */}
          {!isEditing && message.createdAt && (
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-xs text-gray-500 select-none">
                {formatTimestamp(message.createdAt)}
              </span>
              {isOwnMessage && (
                <div className="flex">
                  {/* Double checkmark for delivered/read status */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="text-gray-400"
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
    </div>
  );
};

export default ChatAreaMessage;
