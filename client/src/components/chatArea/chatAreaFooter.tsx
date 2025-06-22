import React, { useState } from "react";
import { Button } from "../ui/button";
import { Smile, Paperclip, Camera, Send } from "lucide-react";
import { Input } from "../ui/input";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import SocketService from "@/services/socketService";

const ChatAreaFooter = () => {
  const { activeChat, setMessages, messages } = useChatStore();
  const { user } = useUserStore();
  const [message, setMessage] = useState("");

  const socketService = SocketService.getInstance();

  // Handle form submit
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "" || !activeChat || !user) return;

    const messageId = socketService.sendMessage({
      content: message,
      chatId: activeChat._id,
      senderId: user._id,
    });

    setMessages([
      ...messages,
      {
        messageId: messageId || Date.now().toString(),
        content: message,
        chatId: activeChat._id,
        senderId: user._id,
      },
    ]);
    setMessage("");
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <form onSubmit={handleSendMessage}>
        <div className="p-4">
          <div className="flex items-center gap-2">
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
