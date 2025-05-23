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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.9),transparent)] pointer-events-none opacity-20"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 overflow-y-auto relative ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
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
