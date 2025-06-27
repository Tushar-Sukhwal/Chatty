import { UserApi } from "@/api/userApi";
import { User } from "@/types/types";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Props = {
  user: User;
};

const UserCard = (props: Props) => {
  const handleAddUser = async () => {
    const response = await UserApi.addUserToFriends(props.user.email);
    toast.success("User added to friends", {
      description: "You can now chat with this user",
    });
  };

  return (
    <div>
      <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-muted cursor-pointer border-b border-gray-200 dark:border-border">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-muted flex items-center justify-center overflow-hidden">
          {props.user.avatar ? (
            <img
              src={props.user.avatar}
              alt={props.user.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-gray-500 dark:text-muted-foreground">
              {props.user.userName?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-foreground">
            {props.user.name}
          </span>
          <span className="text-sm text-gray-600 dark:text-muted-foreground">
            @{props.user.userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-muted-foreground">
            {props.user.email}
          </span>
        </div>
        <Button className="ml-auto" onClick={handleAddUser}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
