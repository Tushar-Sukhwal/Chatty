"use client";

import { useUserStore } from "@/store/userStore";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatArea from "@/components/chatArea/chatArea";
import SocketSingleton from "@/services/socketService";
import { UserApi } from "@/api/userApi";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, socketToken, firebaseToken } = useUserStore();
  const { logout } = useAuth();

  const socket = SocketSingleton.getInstance();
  socket.connect();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await UserApi.getMe();
      useUserStore.setState({ user });
    };
    fetchUser();
  }, []);

  return (
    <div className=" flex w-full h-screen">
      {/* Sidebar - 30% width on desktop, full width on mobile */}
      <div className="w-[30%]">
        <Sidebar />
      </div>

      {/* Chat Area - 70% width on desktop, hidden on mobile when sidebar is shown */}
      <div className="w-[70%]">
        <ChatArea />
      </div>
    </div>
  );
}
