import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Props = {};

const ChatAreaNav = (props: Props) => {
  const { activeChat, activeChatName } = useChatStore();
  const { user } = useUserStore();

  if (!activeChat) return null;

  const chatAvatar =
    activeChat.type === "group"
      ? activeChat.avatar
      : activeChat.participants.find(
          (participant) => participant.user._id !== user?._id
        )?.user?.avatar;

  const participantCount = activeChat.participants.length;

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatAvatar} alt={activeChatName || "Chat"} />
          <AvatarFallback>
            {activeChatName?.charAt(0).toUpperCase() || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="font-semibold text-gray-900">
            {activeChatName || "Unknown Chat"}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeChat.type}
            </Badge>
            {activeChat.type === "group" && (
              <span className="text-xs text-gray-500">
                {participantCount} member{participantCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add more options here like video call, voice call, etc. */}
      <div className="flex items-center gap-2">
        {/* Placeholder for typing indicator */}
        {/* <span className="text-xs text-gray-500">Someone is typing...</span> */}
      </div>
    </div>
  );
};

export default ChatAreaNav;
