import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import AddUserModal from "../userProfile/addUserModal";

type Props = {};

const SidebarNav = (props: Props) => {


  const handleAddGroup = () => {
    // TODO handleAddGroup
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
          <span className="text-blue-600 font-bold text-2xl">C</span>
        </div>
        <h1 className="text-2xl font-bold">Chatty</h1>
        <Dialog>
          <DialogTrigger>
            <button>add friend</button>
          </DialogTrigger>
          <AddUserModal />
        </Dialog>
        <button onClick={handleAddGroup}>add group</button>
      </div>
    </div>
  );
};

export default SidebarNav;
