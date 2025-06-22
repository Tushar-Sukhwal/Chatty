"use client";

import { useUserStore } from "@/store/userStore";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatArea from "@/components/chatArea/chatArea";
import SocketSingleton from "@/services/socketService";
import { UserApi } from "@/api/userApi";
import { useEffect, useState } from "react";
import { MessageApi } from "@/api/messageApi";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const socket = SocketSingleton.getInstance();
  const { activeChat } = useChatStore();
  const [showMobileChat, setShowMobileChat] = useState(false);

  socket.connect();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await UserApi.getMe();
      const messages = await MessageApi.getAllMessages();
      useChatStore.setState({ messages });
      useUserStore.setState({ user });
    };
    fetchUser();
  }, []);

  // Show chat when activeChat changes on mobile
  useEffect(() => {
    if (activeChat) {
      setShowMobileChat(true);
    }
  }, [activeChat]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Mobile: Show sidebar or chat based on state */}
      <div className="md:hidden w-full">
        {!showMobileChat || !activeChat ? (
          <Sidebar />
        ) : (
          <div className="flex flex-col h-full">
            {/* Mobile Chat Header */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileChat(false)}
                className="mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="font-medium">Back to Chats</span>
            </div>
            <div className="flex-1">
              <ChatArea />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show both sidebar and chat */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="w-80 lg:w-96 flex-shrink-0 border-r border-gray-200">
          <Sidebar />
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <ChatArea />
        </div>
      </div>
    </div>
  );
}
