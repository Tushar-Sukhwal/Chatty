"use client";

import React, { useState, useRef, useEffect } from "react";
import { Chat, Message, User } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  chat: Chat | null;
  messages: Message[];
  currentUser: User;
  onBack?: () => void;
  isMobile: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  currentUser,
  onBack,
  isMobile,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // In a real app, this would send the message to the server
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">Select a chat</div>
          <div className="text-gray-400 text-sm">
            Choose a conversation to start messaging
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && onBack && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">{chat.name}</h2>
              <p className="text-sm text-gray-500">
                {chat.lastMessage === "typing..."
                  ? "typing..."
                  : "last seen recently"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* WhatsApp-like background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='pattern' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='M20 20m-4 0a4 4 0 1 1 8 0a4 4 0 1 1 -8 0' fill='%23000000' fill-opacity='0.1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23pattern)'/%3e%3c/svg%3e")`,
            backgroundColor: "#f0f2f5",
          }}
        />
        <ScrollArea className="h-full relative z-10" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {/* Date separator */}
            <div className="flex justify-center">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                22 JANUARY 2015
              </div>
            </div>

            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser._id;

              return (
                <div
                  key={message.messageId}
                  className={cn(
                    "flex",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3 shadow-sm",
                      isOwnMessage
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                    )}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <div
                      className={cn(
                        "flex items-center justify-end mt-1 space-x-1",
                        isOwnMessage ? "text-green-100" : "text-gray-500"
                      )}
                    >
                      <span className="text-xs">
                        {formatMessageTime(message.sentAt)}
                      </span>
                      {isOwnMessage && (
                        <div className="flex">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {/* Double check mark for read messages */}
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              className="fill-current"
                            >
                              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 flex-shrink-0"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="pr-10 bg-white border-gray-200"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {newMessage.trim() ? (
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              <Mic className="h-5 w-5 text-gray-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
