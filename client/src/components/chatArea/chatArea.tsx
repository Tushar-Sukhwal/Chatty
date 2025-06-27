import React, { useEffect, useRef, useState } from "react";
import ChatAreaFooter from "./chatAreaFooter";
import ChatAreaNav from "./chatAreaNav";
import ChatAreaMessage from "./chatAreaMessage";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Message } from "@/types/types";

type Props = {
  hideMobileNav?: boolean;
};

// Component for date separator
const DateSeparator = ({ date }: { date: string }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (messageDate.getTime() === todayDate.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex justify-center my-4">
      <div className="bg-white dark:bg-card px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-border">
        <span className="text-xs text-gray-600 dark:text-muted-foreground font-medium">
          {formatDate(date)}
        </span>
      </div>
    </div>
  );
};

// Function to group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach((message) => {
    if (message.createdAt) {
      const date = new Date(message.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    }
  });

  return groups;
};

const ChatArea = ({ hideMobileNav = false }: Props) => {
  const { messages, activeChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null); // msg to reply to
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  // Store refs for each message to enable scrolling to specific messages
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-scroll to bottom when messages change
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Function to scroll to a specific message and highlight it
  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Highlight the message
      setHighlightedMessageId(messageId);

      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
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

  const handleMessageEdit = (messageId: string, content: string) => {};

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const { user } = useUserStore.getState();

      // Always scroll if the last message is from current user (just sent a message)
      // Or scroll if user is near bottom and not currently scrolling
      if (
        lastMessage.senderId === user?._id ||
        (!isUserScrolling && isNearBottom())
      ) {
        scrollToBottom();
      }
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
      <div className="flex flex-col h-full bg-gray-50 dark:bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-muted-foreground">
            <h3 className="text-xl font-medium mb-2 dark:text-foreground">
              Welcome to Chatty
            </h3>
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredMessages = messages.filter(
    (message) => message.chatId === activeChat._id
  );

  // Group messages by date
  const messageGroups = groupMessagesByDate(filteredMessages);
  const sortedDates = Object.keys(messageGroups).sort();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background relative">
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
        className="flex-1 overflow-y-auto p-3 md:p-4"
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-muted-foreground text-center px-4">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date separator */}
                <DateSeparator date={date} />

                {/* Messages for this date */}
                <div className="space-y-1">
                  {messageGroups[date].map((message) => (
                    <ChatAreaMessage
                      key={message.messageId}
                      message={message}
                      isReplying={isReplying}
                      setIsReplying={setIsReplying}
                      replyToMessage={replyToMessage}
                      setReplyToMessage={setReplyToMessage}
                      scrollToMessage={scrollToMessage}
                      messageRefs={messageRefs}
                      highlightedMessageId={highlightedMessageId}
                    />
                  ))}
                </div>
              </div>
            ))}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 right-4 z-10">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground shadow-lg"
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
      <ChatAreaFooter
        isReplying={isReplying}
        setIsReplying={setIsReplying}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
      />
    </div>
  );
};

export default ChatArea;
