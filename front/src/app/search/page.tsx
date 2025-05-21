"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState<number | null>(null);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const { searchUsers, addDirectChat, sidebarOpen } = useChatsStore();
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId: number) => {
    setIsCreatingChat(userId);
    try {
      const chat = await addDirectChat(userId);
      if (chat) {
        router.push(`/chat/${chat.id}?type=direct`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      setIsCreatingChat(null);
    }
  };

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
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Find Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Search for users by email to start a conversation
            </p>
          </header>

          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-8">
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                              {user.name}
                              {user.isOnline && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartChat(user.id)}
                          disabled={isCreatingChat === user.id}
                        >
                          {isCreatingChat === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <MessageCircle className="h-4 w-4 mr-2" />
                          )}
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No users found matching "{searchTerm}"
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
