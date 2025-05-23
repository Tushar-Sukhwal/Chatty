"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/store/useChatsStore";
import { Search, Plus, UserPlus, UserMinus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ChatMembersProps {
  members: GroupChatUserType[];
  groupId: string;
  isOwner: boolean;
}

export default function ChatMembers({
  members,
  groupId,
  isOwner,
}: ChatMembersProps) {
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { searchUsers, addUserToGroup, removeUserFromGroup } = useChatsStore();

  const handleSearch = async () => {
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Filter out users who are already members
      const filteredResults = results.filter(
        (user) => !members.some((member) => member.user?.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      await addUserToGroup(groupId, userId);
      setSearchResults([]);
      setSearchTerm("");
      setAddMemberDialogOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeUserFromGroup(groupId, memberId);
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };

  return (
    <div className="w-56 md:w-64 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-sm md:text-base">
          Members ({members.length})
        </h3>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setAddMemberDialogOpen(true)}
          >
            <UserPlus size={16} />
          </Button>
        )}
      </div>

      <div className="p-1 md:p-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-1.5 md:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center overflow-hidden">
              <Avatar className="h-6 w-6 md:h-8 md:w-8 mr-1 md:mr-2">
                <AvatarImage src={member.user?.image || ""} />
                <AvatarFallback>
                  {member.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium flex items-center truncate">
                  {member.user?.name}
                  {member.user?.isOnline && (
                    <span className="ml-1 h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  )}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">
                  {member.is_owner ? "Owner" : "Member"}
                </p>
              </div>
            </div>

            {isOwner && !member.is_owner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7"
                onClick={() => handleRemoveMember(member.id)}
              >
                <UserMinus size={12} className="md:size-14 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Search for users by email to add to this group.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search size={16} className="mr-2" />
              Search
            </Button>
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto">
            {isSearching ? (
              <p className="text-center text-gray-500">Searching...</p>
            ) : searchResults.length === 0 ? (
              searchTerm ? (
                <p className="text-center text-gray-500">No users found</p>
              ) : null
            ) : (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMember(user.id)}
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogClose asChild>
            <Button variant="outline" className="mt-4">
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
