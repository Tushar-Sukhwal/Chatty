import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import AddUserModal from "../userProfile/addUserModal";
import CreateChatModal from "../createChat/createChatModal";

type Props = {};

const SidebarNav = (props: Props) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Chatty</h1>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Friend
            </Button>
          </DialogTrigger>
          <AddUserModal />
        </Dialog>

        <CreateChatModal />
      </div>
    </div>
  );
};

export default SidebarNav;
