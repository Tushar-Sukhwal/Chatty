"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Search,
  Plus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar, groups, directChats, activeChatId } =
    useChatsStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-10",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {sidebarOpen && (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            QuickChat
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="flex flex-col items-center py-4 border-b border-gray-200 dark:border-gray-700">
        <Avatar className="h-12 w-12">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        {sidebarOpen && (
          <div className="mt-2 text-center">
            <h3 className="font-medium text-gray-800 dark:text-white">
              {session?.user?.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session?.user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarOpen && "justify-center"
              )}
            >
              <MessageSquare size={20} className="mr-2" />
              {sidebarOpen && <span>Dashboard</span>}
            </Button>
          </Link>
          <Link href="/search">
            <Button
              variant={pathname === "/search" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarOpen && "justify-center"
              )}
            >
              <Search size={20} className="mr-2" />
              {sidebarOpen && <span>Search Users</span>}
            </Button>
          </Link>
          <Link href="/create-group">
            <Button
              variant={pathname === "/create-group" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarOpen && "justify-center"
              )}
            >
              <Plus size={20} className="mr-2" />
              {sidebarOpen && <span>Create Group</span>}
            </Button>
          </Link>
        </div>

        {/* Direct Chats */}
        {sidebarOpen && directChats.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Direct Messages
            </h4>
            <div className="space-y-1">
              {directChats.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}?type=direct`}>
                  <Button
                    variant={activeChatId === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={chat.otherUser.image || ""} />
                        <AvatarFallback>
                          {chat.otherUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{chat.otherUser.name}</span>
                      {chat.otherUser.isOnline && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Group Chats */}
        {sidebarOpen && groups.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Group Chats
            </h4>
            <div className="space-y-1">
              {groups.map((group) => (
                <Link key={group.id} href={`/chat/${group.id}?type=group`}>
                  <Button
                    variant={activeChatId === group.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Users size={18} className="mr-2" />
                    <span className="truncate">{group.title}</span>
                    {group.is_owner && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Owner)
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-start", !sidebarOpen && "justify-center")}
            asChild
          >
            <Link href="/settings">
              <Settings size={20} className="mr-2" />
              {sidebarOpen && <span>Settings</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-start", !sidebarOpen && "justify-center")}
            onClick={() => signOut()}
          >
            <LogOut size={20} className="mr-2" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
