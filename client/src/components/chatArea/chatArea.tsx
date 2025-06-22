import React, { useEffect, useRef, useState } from "react";
import ChatAreaFooter from "./chatAreaFooter";
import ChatAreaNav from "./chatAreaNav";
import ChatAreaMessage from "./chatAreaMessage";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type Props = {
  hideMobileNav?: boolean;
};

const ChatArea = ({ hideMobileNav = false }: Props) => {
  const { messages, activeChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Check if user is near the bottom of the scroll
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  // Handle scroll events
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom = isNearBottom();
    setShowScrollButton(!isAtBottom);

    // Set user scrolling flag
    setIsUserScrolling(true);

    // Clear the flag after a delay
    setTimeout(() => setIsUserScrolling(false), 1000);
  };

  // Scroll to bottom when messages change (only if user is near bottom or not scrolling)
  useEffect(() => {
    if (!isUserScrolling && isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  // Always scroll to bottom when active chat changes
  useEffect(() => {
    scrollToBottom("auto"); // Instant scroll for chat changes
    setShowScrollButton(false);
  }, [activeChat]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    scrollToBottom("auto");
  }, []);

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

  const filteredMessages = messages.filter(
    (message) => message.chatId === activeChat._id
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Navigation Header - Hidden on mobile when hideMobileNav is true */}
      {!hideMobileNav && (
        <div className="hidden md:block">
          <ChatAreaNav />
        </div>
      )}

      {/* Show navigation for desktop always, for mobile only when not hidden */}
      <div className="md:hidden">{!hideMobileNav && <ChatAreaNav />}</div>

      {/* Messages Area - scrollable with proper mobile spacing */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4"
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center px-4">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {filteredMessages.map((message) => (
              <ChatAreaMessage key={message.messageId} message={message} />
            ))}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 right-4 z-10">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={() => {
              scrollToBottom();
              setShowScrollButton(false);
            }}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Footer Input Area */}
      <ChatAreaFooter />
    </div>
  );
};

export default ChatArea;
