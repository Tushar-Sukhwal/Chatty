"use client";

import React from "react";
import { Chat, User } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MoreVertical,
  MessageCircle,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  currentUser: User;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  currentUser,
}) => {
  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 30) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200"
        style={{ backgroundColor: "#f0f2f5" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-gray-300">
                {currentUser.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">
                {currentUser.userName}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-gray-600 hover:bg-gray-200"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-gray-600 hover:bg-gray-200"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-gray-600 hover:bg-gray-200"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search or start new chat"
            className="pl-10 bg-white border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div>
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat._id)}
              className={cn(
                "flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors",
                selectedChatId === chat._id && "bg-gray-100"
              )}
            >
              <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback className="bg-gray-300">
                  {chat.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate text-base">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatLastMessageTime(chat.lastMessageAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage === "typing..." ? (
                      <span className="text-green-600 italic font-medium">
                        typing...
                      </span>
                    ) : (
                      truncateMessage(chat.lastMessage)
                    )}
                  </p>

                  {/* Unread count - showing for first chat as example */}
                  {chat._id === "1" && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 ml-2 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      2
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
