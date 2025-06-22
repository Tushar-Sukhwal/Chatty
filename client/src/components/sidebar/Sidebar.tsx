import React from "react";
import SidebarNav from "./SidebarNav";

type Props = {};

const Sidebar = (props: Props) => {
  return (
    <div className="relative bg-gray-100 h-full w-[100%] border-r border-gray-200">
      <SidebarNav />
    </div>
  );
};

export default Sidebar;
