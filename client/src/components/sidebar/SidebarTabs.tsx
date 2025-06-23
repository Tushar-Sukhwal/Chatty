"use client";
import { useChatStore } from "@/store/chatStore";
import { Chat, User } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";

type Props = {
  chat: Chat;
  user: User;
};

const SidebarTabs = (props: Props) => {
  const { chat, user } = props;
  const { setActiveChat, setActiveChatName, activeChat } = useChatStore();
  const { onlineUsers } = useUserStore();
  const isActive = activeChat?._id === chat._id;
  const [online, setOnline] = useState(false);

  const chatName =
    chat.type === "group"
      ? chat.name
      : chat.participants.find(
          (participant) => participant.user._id !== user._id
        )?.user?.name;

  //if direct chat then if the user._id is present in onlineUsers then show online
  useEffect(() => {
    if (
      chat.type === "direct" &&
      (onlineUsers?.includes(chat.participants[0].user._id) ||
        onlineUsers?.includes(chat.participants[1].user._id))
    ) {
      setOnline(true);
    } else {
      setOnline(false);
    }
  }, [onlineUsers]);

  const chatAvatar =
    chat.type === "group"
      ? chat.avatar
      : chat.participants.find(
          (participant) => participant.user._id !== user._id
        )?.user?.avatar;

  const handleChatSelect = () => {
    setActiveChat(chat);
    setActiveChatName(chatName!);
  };

  return (
    <div
      className={cn(
        "w-full p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]",
        isActive
          ? "bg-blue-50 border border-blue-200 shadow-sm"
          : "bg-white border border-gray-200"
      )}
      onClick={handleChatSelect}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={chatAvatar} alt={chatName} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {chatName?.charAt(0).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
          {chat.type === "direct" && (
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                online ? "bg-green-500" : "bg-gray-400"
              )}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-medium truncate text-sm",
                  isActive ? "text-blue-900" : "text-gray-900"
                )}
              >
                {chatName || "Unknown Chat"}
              </h3>
              {chat.type === "group" && online && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    Active
                  </span>
                </div>
              )}
            </div>
            {chat.type === "group" && (
              <Badge variant="secondary" className="text-xs ml-2 bg-gray-100">
                {chat.participants.length}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            {chat.type === "direct" && (
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    online ? "bg-green-500" : "bg-gray-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    online
                      ? isActive
                        ? "text-green-700"
                        : "text-green-600"
                      : isActive
                      ? "text-gray-600"
                      : "text-gray-500"
                  )}
                >
                  {online ? "Online" : "Offline"}
                </span>
              </div>
            )}
            {/* Add last message time or unread count here */}
            <span className="text-xs text-gray-400">
              {/* Placeholder for timestamp */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarTabs;
