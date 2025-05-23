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
  Trash2,
  Share2,
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
import DeleteChatGroup from "@/components/chatGroup/DeleteChatGroup";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";

interface ChatHeaderProps {
  chat: GroupChatType | DirectChatType;
  chatType: ChatType;
  currentUser: CustomUser | null;
}

export default function ChatHeader({
  chat,
  chatType,
  currentUser,
}: ChatHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:p-4 flex items-center justify-between">
      <div className="flex items-center overflow-hidden">
        {chatType === "direct" ? (
          <>
            <Avatar className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3 flex-shrink-0">
              <AvatarImage src={otherUser?.image || ""} />
              <AvatarFallback>
                {otherUser?.name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="font-semibold text-base md:text-lg flex items-center truncate">
                {otherUser?.name}
                {otherUser?.isOnline && (
                  <span className="ml-1 md:ml-2 h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 flex-shrink-0"></span>
                )}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {otherUser?.email}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-8 w-8 md:h-10 md:w-10 rounded-md flex items-center justify-center text-white mr-2 md:mr-3 flex-shrink-0">
              <Users size={16} className="md:size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-base md:text-lg flex items-center truncate">
                {(chat as GroupChatType).title}
                {(chat as GroupChatType).is_owner && (
                  <span className="ml-1 md:ml-2 text-[10px] md:text-xs bg-gray-200 dark:bg-gray-700 px-1 md:px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 flex-shrink-0">
                    Owner
                  </span>
                )}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                Created{" "}
                {new Date(
                  (chat as GroupChatType).created_at
                ).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
        {/* Only show share button for group chats */}
        {chatType === "group" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 size={16} className="md:size-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <MoreVertical size={16} className="md:size-5" />
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
            {chatType === "group" && (chat as GroupChatType).is_owner && (
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 dark:text-red-500 hover:text-red-600 dark:hover:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      {chatType === "group" && (
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-sm md:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Group</DialogTitle>
              <DialogDescription>
                Share this link with others to invite them to join this group
                chat.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 p-2 md:p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden text-xs md:text-sm break-all">
                {shareLink}
              </div>
              <Button
                onClick={copyShareLink}
                size="icon"
                variant="outline"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <Copy size={16} className="md:size-5" />
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

      {/* Delete Group Dialog */}
      {chatType === "group" && currentUser && (
        <DeleteChatGroup
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          groupId={(chat as GroupChatType).id}
          token={currentUser.token!}
        />
      )}
    </header>
  );
}
