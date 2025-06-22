import React from "react";
import { Message } from "@/types/types";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

type Props = {
  message: Message;
};

const ChatAreaMessage = ({ message }: Props) => {
  const { user } = useUserStore();
  const isOwnMessage = message.senderId === user?._id;

  const handleMessageEdit = () => {
    // TODO handleMessageEdit
  };

  const handleMessageDelete = () => {
    // TODO handleMessageDelete
  };

  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        )}
        onContextMenu={(e) => {
          e.preventDefault();
          // Show context menu for edit/delete options
        }}
      >
        <p className="text-sm">{message.content}</p>
        {message.createdAt && (
          <p
            className={cn(
              "text-xs mt-1",
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatAreaMessage;
