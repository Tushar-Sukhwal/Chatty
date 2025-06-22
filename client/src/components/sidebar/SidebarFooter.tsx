import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { UserIcon, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {};

const SidebarFooter = (props: Props) => {
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  const { user } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    useUserStore.setState({
      user: null,
      socketToken: null,
      firebaseToken: null,
    });
    useChatStore.setState({
      chats: [],
      activeChat: null,
      activeChatName: null,
      messages: [],
    });
    router.push("/login");
  };

  return (
    <div className="h-16 bg-white border-t border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user?.name || "User"}
          </span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/profile")}
          className="text-gray-600 hover:text-gray-900"
        >
          <UserIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={signOutLoading}
          className="text-gray-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
