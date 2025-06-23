import React, { useState } from "react";
import { Button } from "../ui/button";
import { Smile, Paperclip, Camera, Send, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import SocketService from "@/services/socketService";

const ChatAreaFooter = () => {
  const { activeChat, setMessages, messages } = useChatStore();
  const { user } = useUserStore();
  const [message, setMessage] = useState("");
  const [showExtraButtons, setShowExtraButtons] = useState(false);

  const socketService = SocketService.getInstance();

  // Handle form submit
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "" || !activeChat || !user) return;

    const messageId = await socketService.sendMessage({
      content: message,
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
    });

    // Create new message object
    const newMessage = {
      messageId: messageId,
      content: message.trim(),
      chatId: activeChat._id,
      senderId: user._id,
      createdAt: new Date(),
    };

    // Add message to the store (this will trigger the scroll in ChatArea)
    setMessages([...messages, newMessage]);

    // Clear the input
    setMessage("");
  };

  return (
    <div className="border-t border-gray-200 bg-white flex-shrink-0">
      <form onSubmit={handleSendMessage}>
        <div className="p-3 md:p-4">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-end gap-2 mb-2">
              <Input
                placeholder="Type a message..."
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[2.5rem]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 flex-shrink-0"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Action Buttons Row */}
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8"
                onClick={() => {
                  /* TODO: Add emoji picker */
                }}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8"
                onClick={() => {
                  /* TODO: Add file attachment */
                }}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8"
                onClick={() => {
                  /* TODO: Add camera */
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatAreaFooter;
