"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Loader2, X, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CreateGroupPage() {
  const [groupTitle, setGroupTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const { searchUsers, createGroup, sidebarOpen } = useChatsStore();
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Filter out already selected users
      const filteredResults = results.filter(
        (user) => !selectedUsers.some((selected) => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter((result) => result.id !== user.id));
  };

  const handleRemoveUser = (user: UserType) => {
    setSelectedUsers(
      selectedUsers.filter((selected) => selected.id !== user.id)
    );
  };

  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) {
      toast.error("Please enter a title for your group", {
        description: "Group title required",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one member for your group", {
        description: "No members selected",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createGroup(
        groupTitle,
        selectedUsers.map((user) => user.id)
      );
      toast.success("Your new group chat has been created successfully", {
        description: "Group created",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group chat. Please try again.", {
        description: "Error",
      });
    } finally {
      setIsCreating(false);
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
              Create Group Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new group and add members
            </p>
          </header>

          <div className="max-w-2xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Title
              </label>
              <Input
                placeholder="Enter group title..."
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Members
              </label>
              <div className="flex items-center space-x-2">
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
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Members ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-2"
                    >
                      <span>{user.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveUser(user)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Results
                </h3>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                {user.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateGroup}
              disabled={
                isCreating || !groupTitle.trim() || selectedUsers.length === 0
              }
              className="w-full"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Create Group Chat
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
