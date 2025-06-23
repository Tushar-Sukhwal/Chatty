"use client";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChatApi } from "@/api/chatApi";
import { useUserStore } from "@/store/userStore";
import React, { useState } from "react";
import { User } from "@/types/types";
import { toast } from "sonner";

type Props = {};

const CreateChatModal = (props: Props) => {
  const [chatName, setChatName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const friends = useUserStore((state) => state.user?.friends) || [];

  const handleFriendToggle = (friendEmail: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendEmail)
        ? prev.filter((email) => email !== friendEmail)
        : [...prev, friendEmail]
    );
  };

  const handleCreateChat = async () => {
    if (!chatName.trim()) {
      toast.error("Please enter a chat name");
      return;
    }

    if (selectedFriends.length < 2) {
      toast.error("Please select at least two friends");
      return;
    }

    setIsCreating(true);
    try {
      await ChatApi.createChat(selectedFriends, chatName.trim());
      // Reset form
      setChatName("");
      setSelectedFriends([]);
      toast.success("Chat created successfully!");
    } catch (error) {
      toast.error("Failed to create chat");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogDescription>
          Create a new group chat with your friends.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="chat-name">Chat Name</Label>
          <Input
            id="chat-name"
            name="chatName"
            placeholder="Enter chat name..."
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <Label>Select Friends ({selectedFriends.length} selected)</Label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {friends.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No friends available. Add some friends first!
              </p>
            ) : (
              friends.map((friend: User) => (
                <div
                  key={friend._id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={friend._id}
                    checked={selectedFriends.includes(friend.email)}
                    onCheckedChange={() => handleFriendToggle(friend.email)}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{friend.name}</p>
                      <p className="text-xs text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={isCreating}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          onClick={handleCreateChat}
          disabled={
            isCreating || !chatName.trim() || selectedFriends.length === 0
          }
        >
          {isCreating ? "Creating..." : "Create Chat"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateChatModal;
