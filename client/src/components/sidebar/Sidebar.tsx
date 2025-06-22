import React from "react";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";
import { useUserStore } from "@/store/userStore";
import SidebarTabs from "./SidebarTabs";

type Props = {};

const Sidebar = (props: Props) => {
  const { user } = useUserStore();
  const chats = user?.chats;
  return (
    <div className="pt-20 relative bg-gray-100 h-full w-[100%] border-r border-gray-200">
      <SidebarNav />
      <SidebarFooter />
      <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-100px)]">
        {chats?.map((chat) => (
          <SidebarTabs user={user!} key={chat._id} chat={chat} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
