import React from "react";
import ChatAreaFooter from "./chatAreaFooter";
import ChatAreaNav from "./chatAreaNav";
import ChatAreaMessage from "./chatAreaMessage";
import { useChatStore } from "@/store/chatStore";

type Props = {};

const ChatArea = (props: Props) => {
  const { messages, activeChat } = useChatStore();

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-xl font-medium mb-2">Welcome to Chatty</h3>
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation Header */}
      <ChatAreaNav />

      {/* Messages Area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages
            .filter((message) => message.chatId === activeChat._id)
            .map((message) => (
              <ChatAreaMessage key={message.messageId} message={message} />
            ))
        )}
      </div>

      {/* Footer Input Area */}
      <ChatAreaFooter />
    </div>
  );
};

export default ChatArea;
