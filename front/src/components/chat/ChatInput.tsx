"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import { useChatsStore } from "@/store/useChatsStore";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, startTyping, stopTyping } = useChatsStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, startTyping, stopTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    sendMessage(message);
    setMessage("");

    // Focus the input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:p-4"
    >
      <div className="flex items-end space-x-1 md:space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 md:px-4 py-2 md:py-3 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            rows={1}
            style={{
              minHeight: "40px",
              maxHeight: "120px",
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-10 md:w-10"
        >
          <Paperclip size={18} className="md:size-5" />
        </Button>
        <Button
          type="submit"
          disabled={!message.trim()}
          className="h-9 md:h-10"
        >
          <Send size={18} className="md:size-5" />
        </Button>
      </div>
    </form>
  );
}
