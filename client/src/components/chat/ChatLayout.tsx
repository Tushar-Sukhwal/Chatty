"use client";

import React, { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "./ChatArea";
import { Chat, Message, User } from "@/types/types";
import { cn } from "@/lib/utils";
import { dummyChats, dummyMessages, dummyUser } from "@/state";

export const ChatLayout: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Simulate mobile detection
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const selectedChat = selectedChatId
    ? dummyChats.find((chat) => chat._id === selectedChatId)
    : null;
  const chatMessages = selectedChatId
    ? dummyMessages.filter((msg) => msg.chatId === selectedChatId)
    : [];

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
  };

  if (isMobile) {
    return (
      <div className="h-screen bg-gray-100">
        {!selectedChatId ? (
          <ChatSidebar
            chats={dummyChats}
            selectedChatId={selectedChatId}
            onChatSelect={handleChatSelect}
            currentUser={dummyUser}
          />
        ) : (
          <ChatArea
            chat={selectedChat as Chat}
            messages={chatMessages}
            currentUser={dummyUser}
            onBack={handleBackToChats}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-200">
      <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-gray-300 shadow-lg">
        <ChatSidebar
          chats={dummyChats}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          currentUser={dummyUser}
        />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatArea
            chat={selectedChat}
            messages={chatMessages}
            currentUser={dummyUser}
            onBack={handleBackToChats}
            isMobile={false}
          />
        ) : (
          <div
            className="h-full flex items-center justify-center"
            style={{ backgroundColor: "#f0f2f5" }}
          >
            <div className="text-center">
              <div className="w-80 h-80 mx-auto mb-8 opacity-10">
                <svg
                  viewBox="0 0 303 172"
                  width="360"
                  height="200"
                  className="fill-current text-gray-400"
                >
                  <path
                    d="M229.565 160.229c-6.729-13.432-5.547-32.298 0-46.25L302.155 0H46.9L0 113.978c-5.547 13.952-4.365 32.818 2.364 46.25L76.112 273H229.565z"
                    fill="url(#linearGradient-1)"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-gray-500 text-xl mb-2 font-light">
                WhatsApp Web
              </div>
              <div className="text-gray-400 text-sm max-w-md mx-auto">
                Send and receive messages without keeping your phone online.
                <br />
                Use WhatsApp on up to 4 linked devices and 1 phone at the same
                time.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
