import React, { useMemo } from "react";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import SidebarTabs from "./SidebarTabs";
import { Chat, Message } from "@/types/types";
import { motion, AnimatePresence } from "framer-motion";

type Props = {};

const Sidebar = (props: Props) => {
  const { user } = useUserStore();
  const { messages } = useChatStore();

  // Create chats with last messages and sort by last message time
  const sortedChats = useMemo(() => {
    if (!user?.chats || !messages) return [];

    const chatsWithLastMessage = user.chats.map((chat: Chat) => {
      // Find all messages for this chat
      const chatMessages = messages.filter(
        (msg: Message) => msg.chatId === chat._id
      );

      // Get the last message (most recent)
      const lastMessage =
        chatMessages.length > 0
          ? chatMessages.reduce((latest: Message, current: Message) => {
              const latestTime = new Date(latest.createdAt || 0).getTime();
              const currentTime = new Date(current.createdAt || 0).getTime();
              return currentTime > latestTime ? current : latest;
            })
          : null;

      return {
        chat,
        lastMessage,
        lastMessageTime: lastMessage?.createdAt
          ? new Date(lastMessage.createdAt).getTime()
          : 0,
      };
    });

    // Sort by last message time (most recent first)
    return chatsWithLastMessage.sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );
  }, [user?.chats, messages]);

  // Animation variants for smooth cascading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Small delay between each chat item
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.5,
      },
    },
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {sortedChats && sortedChats.length > 0 ? (
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              layout
            >
              {sortedChats.map(({ chat, lastMessage }, index) => (
                <motion.div
                  key={chat._id}
                  layoutId={`chat-${chat._id}`}
                  variants={itemVariants}
                  layout="position"
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                      mass: 0.5,
                    },
                  }}
                  style={{
                    zIndex: sortedChats.length - index, // Ensures proper layering during animation
                  }}
                >
                  <SidebarTabs
                    user={user!}
                    chat={chat}
                    lastMessage={lastMessage}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center justify-center h-32"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 text-sm">No chats yet</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <SidebarFooter />
      </div>
    </div>
  );
};

export default Sidebar;
