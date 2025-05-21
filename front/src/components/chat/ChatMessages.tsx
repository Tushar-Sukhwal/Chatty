"use client";

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ChatMessagesProps {
  messages: MessageType[];
  loading: boolean;
  currentUser: UserType | null;
  typingUsers: string[]; // Assumed to be array of user IDs
  allUsersInChat: UserType[]; // All users in the current chat, for name lookup
}

export default function ChatMessages({
  messages,
  loading,
  currentUser,
  typingUsers,
  allUsersInChat,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (loading) {
    return (
      <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  const typingDisplayNames = typingUsers
    .map((userId) => {
      const user = allUsersInChat?.find((u) => u.id.toString() === userId);
      return user ? user.name : null;
    })
    .filter((name) => name !== null && name !== currentUser?.name) as string[];

  let typingIndicatorText = "";
  if (typingDisplayNames.length === 1) {
    typingIndicatorText = `${typingDisplayNames[0]} is typing`;
  } else if (typingDisplayNames.length === 2) {
    typingIndicatorText = `${typingDisplayNames[0]} and ${typingDisplayNames[1]} are typing`;
  } else if (typingDisplayNames.length > 0) {
    // For 3 or more, use count
    typingIndicatorText = `${typingDisplayNames.length} people are typing`;
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {(messages || []).length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(messages || []).map((message) => {
            const isCurrentUser =
              currentUser && message.name === currentUser.name;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex max-w-[80%]">
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div>
                    {!isCurrentUser && (
                      <p className="text-xs text-gray-500 mb-1">
                        {message.name}
                      </p>
                    )}

                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingIndicatorText && (
            <div className="flex items-center">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg py-2 px-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="mr-2">{typingIndicatorText}</span>
                  <span className="flex space-x-1">
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
