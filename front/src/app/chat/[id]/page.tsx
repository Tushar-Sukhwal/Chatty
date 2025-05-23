"use client";

import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatMembers from "@/components/chat/ChatMembers";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { getSocket } from "@/lib/socket.config";
// ChatType is already available from the store

export default function ChatPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const chatType = (searchParams.get("type") as ChatType) || "group";
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const {
    setActiveChat,
    fetchCurrentUser,
    fetchGroups,
    fetchDirectChats,
    activeChatId,
    activeChatType,
    messages,
    loadingMessages,
    chatMembers,
    sidebarOpen,
    groups,
    directChats,
    typingUsers,
    currentUser,
  } = useChatsStore();

  useEffect(() => {
    // Only fetch data when we have a valid session
    if (status === "authenticated" && (session?.user as CustomUser)?.token) {
      fetchCurrentUser();
      fetchGroups();
      fetchDirectChats();
    }
  }, [fetchCurrentUser, fetchGroups, fetchDirectChats, status, session]);

  useEffect(() => {
    // Set active chat when user is authenticated, currentUser is loaded, and params.id is available.
    if (status === "authenticated" && currentUser && params.id) {
      setActiveChat(params.id, chatType);
    }
  }, [params.id, chatType, setActiveChat, status, currentUser]);

  if (status === "loading" || !currentUser || !activeChatId) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Find the active chat data
  const activeChat =
    chatType === "direct"
      ? directChats.find((chat: any) => chat.id === activeChatId)
      : groups.find((group: any) => group.id === activeChatId);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-screen">
        Chat not found
      </div>
    );
  }

  // Get typing users for this chat
  const activeTypingUsers = typingUsers[activeChatId] || [];

  // Construct allUsersInChat for name lookup in ChatMessages
  let allUsersInChat: UserType[] = [];
  if (currentUser) {
    if (chatType === "group") {
      allUsersInChat = chatMembers
        .map((member) => member.user)
        .filter(Boolean) as UserType[];
    } else if (
      chatType === "direct" &&
      activeChat &&
      (activeChat as DirectChatType).otherUser
    ) {
      allUsersInChat = [currentUser, (activeChat as DirectChatType).otherUser];
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="h-full flex flex-col">
          <ChatHeader
            chat={activeChat}
            chatType={chatType}
            currentUser={currentUser as CustomUser | null}
          />

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <ChatMessages
                messages={messages}
                loading={loadingMessages}
                currentUser={currentUser}
                typingUsers={activeTypingUsers}
                allUsersInChat={allUsersInChat}
              />
              <ChatInput />
            </div>

            {/* Only show members panel for group chats */}
            {chatType === "group" && (
              <div className="hidden md:block">
                <ChatMembers
                  members={chatMembers}
                  groupId={activeChatId}
                  isOwner={
                    chatType === "group" && "is_owner" in activeChat
                      ? Boolean(activeChat.is_owner)
                      : false
                  }
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
