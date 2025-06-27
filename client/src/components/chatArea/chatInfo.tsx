"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { Chat } from "@/types/types";
import { Pencil, Users, Calendar, Mail } from "lucide-react";

interface ChatInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInfo: React.FC<ChatInfoProps> = ({ isOpen, onClose }) => {
  const { activeChat } = useChatStore();
  const { user } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  if (!activeChat) return null;

  const isGroupChat = activeChat.type === "group";
  const canEdit = isGroupChat; // You can add more conditions here like checking if user is admin

  const otherParticipant = activeChat.participants.find(
    (participant) => participant.user._id !== user?._id
  );

  const handleEdit = () => {
    setEditedName(activeChat.name || "");
    setEditedDescription(activeChat.description || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality with API call
    console.log("Saving changes:", {
      name: editedName,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName("");
    setEditedDescription("");
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGroupChat ? (
              <Users className="h-5 w-5" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            Chat Information
          </DialogTitle>
          <DialogDescription>
            {isGroupChat
              ? "Group chat details and members"
              : "Direct chat information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chat Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  isGroupChat
                    ? activeChat.avatar
                    : otherParticipant?.user?.avatar
                }
                alt="Chat Avatar"
              />
              <AvatarFallback className="text-2xl">
                {isGroupChat
                  ? activeChat.name?.charAt(0).toUpperCase() || "G"
                  : otherParticipant?.user?.name?.charAt(0).toUpperCase() ||
                    "U"}
              </AvatarFallback>
            </Avatar>

            {/* Chat Name */}
            <div className="w-full">
              <Label htmlFor="chatName">Name</Label>
              {isEditing ? (
                <Input
                  id="chatName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium">
                    {isGroupChat
                      ? activeChat.name || "Unnamed Group"
                      : otherParticipant?.user?.name || "Unknown User"}
                  </p>
                  {canEdit && (
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description (Group chats only) */}
            {isGroupChat && (
              <div className="w-full">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    {activeChat.description || "No description"}
                  </p>
                )}
              </div>
            )}

            {/* Chat Type and Created Date */}
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {isGroupChat ? "Group Chat" : "Direct Chat"}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(activeChat.createdAt || new Date())}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Participants */}
          <div>
            <Label className="text-sm font-medium">
              {isGroupChat
                ? `Members (${activeChat.participants.length})`
                : "Participant"}
            </Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {activeChat.participants.map((participant) => (
                <div
                  key={participant.user._id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={participant.user.avatar}
                      alt={participant.user.name}
                    />
                    <AvatarFallback>
                      {participant.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.user.name}
                      {participant.user._id === user?._id && " (You)"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {participant.user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInfo;
