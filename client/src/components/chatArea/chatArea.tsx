import React from "react";
import ChatAreaFooter from "./chatAreaFooter";
import ChatAreaNav from "./chatAreaNav";

type Props = {};

const ChatArea = (props: Props) => {
  return (
    <div className="relative h-full w-full">
      <ChatAreaNav />
      <ChatAreaFooter />
    </div>
  );
};

export default ChatArea;
