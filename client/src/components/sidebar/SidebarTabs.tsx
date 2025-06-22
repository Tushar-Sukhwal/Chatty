import { useChatStore } from "@/store/chatStore";
import { Chat, User } from "@/types/types";
import React from "react";

type Props = {
  chat: Chat;
  user: User;
};

const SidebarTabs = (props: Props) => {
  const { chat, user } = props;
  const { setActiveChat, setActiveChatName } = useChatStore();

  const chatName =
    chat.type === "group"
      ? chat.name
      : chat.participants.find(
          (participant) => participant.user._id !== user._id
        )?.user?.name;

  const chatAvatar =
    chat.type === "group"
      ? chat.avatar
      : chat.participants.find(
          (participant) => participant.user._id !== user._id
        )?.user?.avatar;
  console.log(chatAvatar);
  return (
    <div
      className="z-2 border-2 border-gray-200 w-full h-10 bg-white rounded-md p-2"
      onClick={() => {
        setActiveChat(chat);
        setActiveChatName(chatName!);
      }}
    >
      <div className="flex items-center gap-2">
        <img
          src={chatAvatar}
          alt={chatName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{chatName}</span>
          <span className="text-xs text-gray-500">{chat.type}</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarTabs;
