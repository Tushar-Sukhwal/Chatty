"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Share,
  Users,
  MoreVertical,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatsStore } from "@/store/useChatsStore";
import { toast } from "sonner";
import Env from "@/lib/env";

interface ChatHeaderProps {
  chat: GroupChatType | DirectChatType;
  chatType: ChatType;
}

export default function ChatHeader({ chat, chatType }: ChatHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Get the share link for group chats
  const shareLink =
    chatType === "group"
      ? `${Env.APP_URL}/join-group/${(chat as GroupChatType).share_link}`
      : "";

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link has been copied to clipboard", {
      description: "Link copied",
    });
  };

  // For direct chats, get the other user
  const otherUser =
    chatType === "direct" ? (chat as DirectChatType).otherUser : null;

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center">
        {chatType === "direct" ? (
          <>
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={otherUser?.image || ""} />
              <AvatarFallback>
                {otherUser?.name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg flex items-center">
                {otherUser?.name}
                {otherUser?.isOnline && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                )}
              </h2>
              <p className="text-sm text-gray-500">{otherUser?.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-10 w-10 rounded-md flex items-center justify-center text-white mr-3">
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-lg flex items-center">
                {(chat as GroupChatType).title}
                {(chat as GroupChatType).is_owner && (
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                    Owner
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                Created{" "}
                {new Date(
                  (chat as GroupChatType).created_at
                ).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Only show share button for group chats */}
        {chatType === "group" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share size={20} />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {chatType === "group" && (
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share className="mr-2 h-4 w-4" />
                Share Group
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              View Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      {chatType === "group" && (
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Group</DialogTitle>
              <DialogDescription>
                Share this link with others to invite them to join this group
                chat.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden text-sm">
                {shareLink}
              </div>
              <Button onClick={copyShareLink} size="icon" variant="outline">
                <Copy size={18} />
              </Button>
            </div>
            <div className="mt-4">
              <Button className="w-full" onClick={copyShareLink}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Invite Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}
