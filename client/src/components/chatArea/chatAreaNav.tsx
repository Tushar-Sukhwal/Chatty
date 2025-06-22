import { useChatStore } from "@/store/chatStore";
import React from "react";

type Props = {};

const chatAreaNav = (props: Props) => {
  //this will show chat name and members of the chat in short form, also if anyone is typing it will show the name of the user typing
  const { activeChat, activeChatName } = useChatStore();
  return (
    <div className="absolute top-0 left-0 w-full h-10 bg-white border-b border-gray-200 flex items-center justify-between">
      <div>{activeChatName}</div>
    </div>
  );
};

export default chatAreaNav;
