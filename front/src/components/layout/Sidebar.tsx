"use client";

import React, { useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar, groups, directChats, activeChatId } =
    useChatsStore();

  // Close sidebar on mobile when navigating to a new page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        toggleSidebar();
      }
    };

    // Check on mount and when path changes
    if (window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname, sidebarOpen, toggleSidebar]);

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 shadow-sm",
          sidebarOpen ? "w-64" : "w-16",
          !sidebarOpen && "md:w-20", // Only on larger screens we show the minimized sidebar
          !sidebarOpen && "w-0 -translate-x-full md:translate-x-0" // Hide completely on mobile when closed
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {sidebarOpen && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuickChat
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center py-5 border-b border-gray-200 dark:border-gray-700">
          <Avatar className="h-11 w-11 md:h-14 md:w-14 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="mt-3 text-center">
              <h3 className="font-medium text-gray-800 dark:text-white truncate max-w-[180px]">
                {session?.user?.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px] mt-0.5">
                {session?.user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="p-2 md:p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {/* Main Navigation */}
          <div className="space-y-1 md:space-y-2">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-medium",
                  !sidebarOpen && "justify-center",
                  pathname === "/dashboard" && "bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-700"
                )}
              >
                <MessageSquare
                  size={18}
                  className={cn(sidebarOpen ? "mr-2" : "", pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : "")}
                />
                {sidebarOpen && <span>Dashboard</span>}
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant={pathname === "/search" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-medium",
                  !sidebarOpen && "justify-center",
                  pathname === "/search" && "bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-700"
                )}
              >
                <Search 
                  size={18} 
                  className={cn(sidebarOpen ? "mr-2" : "", pathname === "/search" ? "text-blue-600 dark:text-blue-400" : "")} 
                />
                {sidebarOpen && <span>Search Users</span>}
              </Button>
            </Link>
            <Link href="/create-group">
              <Button
                variant={pathname === "/create-group" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-medium",
                  !sidebarOpen && "justify-center",
                  pathname === "/create-group" && "bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-700"
                )}
              >
                <Plus 
                  size={18} 
                  className={cn(sidebarOpen ? "mr-2" : "", pathname === "/create-group" ? "text-blue-600 dark:text-blue-400" : "")} 
                />
                {sidebarOpen && <span>Create Group</span>}
              </Button>
            </Link>
          </div>

          {/* Direct Chats */}
          {sidebarOpen && directChats.length > 0 && (
            <div className="mt-4 md:mt-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Direct Messages
              </h4>
              <div className="space-y-1">
                {directChats.map((chat) => (
                  <Link key={chat.id} href={`/chat/${chat.id}?type=direct`}>
                    <Button
                      variant={activeChatId === chat.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start rounded-lg",
                        activeChatId === chat.id && "bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-700"
                      )}
                      size="sm"
                    >
                      <div className="flex items-center overflow-hidden">
                        <Avatar className="h-6 w-6 mr-2 flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-700">
                          <AvatarImage src={chat.otherUser.image || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xs">
                            {chat.otherUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("truncate", activeChatId === chat.id ? "font-medium" : "")}>
                          {chat.otherUser.name}
                        </span>
                        {chat.otherUser.isOnline && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-green-500 flex-shrink-0 ring-1 ring-green-200 dark:ring-green-900"></span>
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
            <div className="mt-4 md:mt-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Group Chats
              </h4>
              <div className="space-y-1">
                {groups.map((group) => (
                  <Link key={group.id} href={`/chat/${group.id}?type=group`}>
                    <Button
                      variant={
                        activeChatId === group.id ? "secondary" : "ghost"
                      }
                      className={cn(
                        "w-full justify-start rounded-lg",
                        activeChatId === group.id && "bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-700"
                      )}
                      size="sm"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="bg-gradient-to-br from-blue-600 to-violet-600 h-6 w-6 rounded-md flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-sm">
                          <Users size={12} />
                        </div>
                        <span className={cn("truncate", activeChatId === group.id ? "font-medium" : "")}>
                          {group.title}
                        </span>
                        {group.is_owner && (
                          <span className="ml-1 text-[10px] bg-blue-100 dark:bg-gray-700 px-1 py-0.5 rounded text-blue-700 dark:text-blue-300 flex-shrink-0">
                            Owner
                          </span>
                        )}
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("justify-start", !sidebarOpen && "justify-center")}
              asChild
            >
              <Link href="/settings">
                <Settings size={18} className={sidebarOpen ? "mr-2" : ""} />
                {sidebarOpen && <span>Settings</span>}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("justify-start hover:text-red-600 dark:hover:text-red-400", !sidebarOpen && "justify-center")}
              onClick={() => signOut()}
            >
              <LogOut size={18} className={sidebarOpen ? "mr-2" : ""} />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button - Fixed at the bottom on small screens */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden fixed left-4 bottom-4 z-40 rounded-full h-12 w-12 shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <Menu size={24} />
      </Button>
    </>
  );
}
