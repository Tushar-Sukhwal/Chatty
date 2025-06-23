import React from "react";
import { Message } from "@/types/types";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";

type Props = {
  message: Message;
};

const ChatAreaMessage = ({ message }: Props) => {
  const { user } = useUserStore();
  const isOwnMessage = message.senderId === user?._id;
  const { activeChat } = useChatStore();
  const isGroupChat = activeChat?.type === "group";

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
    // TODO handleMessageEdit
  };

  const handleMessageDelete = () => {
    // TODO handleMessageDelete
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
    <div className="flex w-full mb-1">
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
          onContextMenu={(e) => {
            e.preventDefault();
            // Show context menu for edit/delete options
          }}
        >
          {/* Show sender name for group chats */}
          {isGroupChat && !isOwnMessage && senderName && (
            <p className="text-xs font-semibold mb-1 text-blue-600">
              {senderName}
            </p>
          )}

          {/* Message content with timestamp inline */}
          <div className="flex items-end gap-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {message.content}
            </p>
            {message.createdAt && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
    </div>
  );
};

export default ChatAreaMessage;
