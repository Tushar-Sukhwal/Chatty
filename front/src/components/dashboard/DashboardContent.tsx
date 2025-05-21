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
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {currentUser.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start chatting with your friends or create a new group.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Chats Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Direct Messages
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/search">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Link>
            </Button>
          </div>

          {loadingDirectChats ? (
            <p className="text-gray-500">Loading chats...</p>
          ) : directChats.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No direct messages yet</p>
                <Button asChild variant="default" size="sm">
                  <Link href="/search">
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Chat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {directChats.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}?type=direct`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={chat.otherUser.image || ""} />
                          <AvatarFallback>
                            {chat.otherUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {chat.otherUser.name}
                            {chat.otherUser.isOnline && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                            )}
                          </CardTitle>
                          <CardDescription>
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
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Group Chats
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/create-group">
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Link>
            </Button>
          </div>

          {loadingGroups ? (
            <p className="text-gray-500">Loading groups...</p>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No group chats yet</p>
                <Button asChild variant="default" size="sm">
                  <Link href="/create-group">
                    <Plus className="h-4 w-4 mr-2" />
                    Create a Group
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <Link key={group.id} href={`/chat/${group.id}?type=group`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-10 w-10 rounded-md flex items-center justify-center text-white mr-3">
                          <Users size={20} />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {group.title}
                            {group.is_owner && (
                              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                Owner
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Created{" "}
                            {new Date(group.created_at).toLocaleDateString()}
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
