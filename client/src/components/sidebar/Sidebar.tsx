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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats && chats.length > 0 ? (
          chats.map((chat) => (
            <SidebarTabs user={user!} key={chat._id} chat={chat} />
          ))
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 text-sm">No chats yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <SidebarFooter />
      </div>
    </div>
  );
};

export default Sidebar;
