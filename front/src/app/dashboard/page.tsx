"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import Sidebar from "@/components/layout/Sidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { CustomUser } from "../api/auth/[...nextauth]/options";

export default function Dashboard() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const {
    fetchCurrentUser,
    fetchGroups,
    fetchDirectChats,
    sidebarOpen,
    currentUser,
    groups,
    directChats,
    loadingGroups,
    loadingDirectChats,
  } = useChatsStore();

  useEffect(() => {
    // Only fetch data when we have a valid session
    if (status === "authenticated" && (session?.user as CustomUser)?.token) {
      fetchCurrentUser();
      fetchGroups();
      fetchDirectChats();
    }
  }, [fetchCurrentUser, fetchGroups, fetchDirectChats, status, session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <DashboardContent
          currentUser={currentUser}
          groups={groups}
          directChats={directChats}
          loadingGroups={loadingGroups}
          loadingDirectChats={loadingDirectChats}
        />
      </main>
    </div>
  );
}
