"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Plus } from "lucide-react";

interface DashboardContentProps {
  currentUser: UserType | null;
  groups: GroupChatType[];
  directChats: DirectChatType[];
  loadingGroups: boolean;
  loadingDirectChats: boolean;
}

export default function DashboardContent({
  currentUser,
  groups,
  directChats,
  loadingGroups,
  loadingDirectChats,
}: DashboardContentProps) {
  if (!currentUser) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white relative">
          Welcome, {currentUser.name}!
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mt-2 rounded-full"></div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 md:mt-3 max-w-3xl">
          Start chatting with your friends or create a new group to collaborate
          together.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Direct Chats Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600 dark:text-blue-400" />
              Direct Messages
            </h2>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 md:h-9 text-xs md:text-sm font-medium"
            >
              <Link href="/search">
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                New Chat
              </Link>
            </Button>
          </div>

          {loadingDirectChats ? (
            <div className="flex justify-center items-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Loading chats...</p>
              </div>
            </div>
          ) : directChats.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center py-10">
                <div className="bg-blue-50 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No direct messages yet
                </h3>
                <p className="text-gray-500 mb-6 text-sm md:text-base max-w-sm mx-auto">
                  Connect with friends and colleagues to start one-on-one
                  conversations
                </p>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="h-9 md:h-10 text-xs md:text-sm"
                >
                  <Link href="/search">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Start a Chat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {directChats.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}?type=direct`}>
                  <Card className="hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 mr-3 md:mr-4 ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800">
                          <AvatarImage src={chat.otherUser.image || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
                            {chat.otherUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <CardTitle className="text-base md:text-lg flex items-center truncate">
                            {chat.otherUser.name}
                            {chat.otherUser.isOnline && (
                              <span className="ml-2 md:ml-3 h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 ring-1 ring-green-200 dark:ring-green-800"></span>
                            )}
                          </CardTitle>
                          <CardDescription className="truncate text-xs md:text-sm mt-1">
                            {chat.otherUser.email}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Group Chats Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Users className="h-5 w-5 md:h-6 md:w-6 mr-2 text-purple-600 dark:text-purple-400" />
              Group Chats
            </h2>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 md:h-9 text-xs md:text-sm font-medium"
            >
              <Link href="/create-group">
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                New Group
              </Link>
            </Button>
          </div>

          {loadingGroups ? (
            <div className="flex justify-center items-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Loading groups...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center py-10">
                <div className="bg-purple-50 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No group chats yet
                </h3>
                <p className="text-gray-500 mb-6 text-sm md:text-base max-w-sm mx-auto">
                  Create a group chat to collaborate with multiple people at
                  once
                </p>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="h-9 md:h-10 text-xs md:text-sm"
                >
                  <Link href="/create-group">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Create a Group
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {groups.map((group) => (
                <Link key={group.id} href={`/chat/${group.id}?type=group`}>
                  <Card className="hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-purple-600 to-violet-700 h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center text-white mr-3 md:mr-4 shadow-sm">
                          <Users size={20} className="md:size-6" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base md:text-lg flex items-center truncate">
                            {group.title}
                            {group.is_owner && (
                              <span className="ml-2 md:ml-3 text-[10px] md:text-xs bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full text-purple-700 dark:text-purple-300">
                                Owner
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="truncate text-xs md:text-sm mt-1">
                            Created{" "}
                            {new Date(group.created_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
