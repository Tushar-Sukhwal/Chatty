import { useAppSelector } from "@/app/redux";
import React from "react";

type Props = {};

const Sidebar = (props: Props) => {
  const chatList = useAppSelector((state) => state.global.chatList);
  return (
    <div>
      {chatList.map((chat) => (
        <div key={chat._id}>{chat.name}</div>
      ))}
    </div>
  );
};

export default Sidebar;
