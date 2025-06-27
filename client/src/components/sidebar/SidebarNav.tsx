import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus, UserPlus, MessageCirclePlus } from "lucide-react";
import AddUserModal from "../userProfile/addUserModal";
import CreateChatModal from "../createChat/createChatModal";

type Props = {};

const SidebarNav = (props: Props) => {
  return (
    <div className="h-16 bg-white dark:bg-card border-b border-gray-200 dark:border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 dark:bg-primary rounded-full flex items-center justify-center">
          <span className="text-white dark:text-primary-foreground font-bold text-lg">
            C
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">
          Chatty
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Friend
            </Button>
          </DialogTrigger>
          <AddUserModal />
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <MessageCirclePlus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </DialogTrigger>
          <CreateChatModal />
        </Dialog>
      </div>
    </div>
  );
};

export default SidebarNav;
