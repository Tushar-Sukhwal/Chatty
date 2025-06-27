"use client";
import { useChatStore } from "@/store/chatStore";
import { Chat, User, Message } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";

type Props = {
  chat: Chat;
  user: User;
  lastMessage?: Message | null;
};

const SidebarTabs = (props: Props) => {
  const { chat, user, lastMessage } = props;
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

  // Format last message for display
  const formatLastMessage = (message: Message) => {
    if (!message?.content) return "No messages yet";

    // Truncate long messages
    const maxLength = 40;
    if (message.content.length > maxLength) {
      return message.content.substring(0, maxLength) + "...";
    }
    return message.content;
  };

  // Format timestamp for last message
  const formatMessageTime = (createdAt?: Date) => {
    if (!createdAt) return "";

    const messageDate = new Date(createdAt);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      // Less than a week
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <motion.div
      className={cn(
        "w-full p-3 rounded-lg cursor-pointer transition-colors duration-200 relative overflow-hidden",
        isActive
          ? "bg-blue-50 border border-blue-200 shadow-sm"
          : "bg-white border border-gray-200"
      )}
      onClick={handleChatSelect}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        backgroundColor: isActive ? undefined : "#f9fafb",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.5,
        },
      }}
      whileTap={{
        scale: 0.98,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 30,
          mass: 0.3,
        },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
          layoutId="activeIndicator"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={chatAvatar} alt={chatName} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {chatName?.charAt(0).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
          {chat.type === "direct" && (
            <motion.div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                online ? "bg-green-500" : "bg-gray-400"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
                delay: 0.1,
              }}
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <motion.h3
                className={cn(
                  "font-medium truncate text-sm",
                  isActive ? "text-blue-900" : "text-gray-900"
                )}
                layoutId={`chatName-${chat._id}`}
              >
                {chatName || "Unknown Chat"}
              </motion.h3>
              {chat.type === "group" && online && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="text-xs text-green-600 font-medium">
                    Active
                  </span>
                </motion.div>
              )}
            </div>
            {chat.type === "group" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="secondary" className="text-xs ml-2 bg-gray-100">
                  {chat.participants.length}
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p
                className={cn(
                  "text-xs truncate",
                  isActive ? "text-gray-600" : "text-gray-500"
                )}
              >
                {lastMessage
                  ? formatLastMessage(lastMessage)
                  : "No messages yet"}
              </p>
            </motion.div>
            <motion.span
              className="text-xs text-gray-400 ml-2 flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {lastMessage?.createdAt &&
                formatMessageTime(lastMessage.createdAt)}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarTabs;
