import React from "react";
import { Chat } from "@/types/types";
import { useChatStore } from "@/store/chatStore";

type Props = {
  chat: Chat;
};

const SidebarTabs = (props: Props) => {
  //here we will show the last message of the chat also will show number of unread messages in a bubble if there are any
  const { setActiveChat } = useChatStore();

  const handleSideBarTabClick = () => {
    // TODO handleSideBarTabClick
  };

  return (
    <div onClick={handleSideBarTabClick}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
          <span className="text-blue-600 font-bold text-2xl">C</span>
        </div>
        <div className="flex flex-col">
          <span className="text-blue-600 font-bold text-2xl">
            {props.chat.chatName}
          </span>
          {/* also the online staus of chats  */}
          <span className="text-gray-500 text-sm">{/* last message */}</span>
          <span className="text-gray-500 text-sm">
            {/* number of unread messages in a bubble if there are any */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarTabs;
