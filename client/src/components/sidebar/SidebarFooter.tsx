import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import React from "react";

import { UserIcon } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

type Props = {};

const SidebarFooter = (props: Props) => {
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  const router = useRouter();
  const handleLogout = async () => {
    await signOut();
    useUserStore.setState({
      user: null,
      socketToken: null,
      firebaseToken: null,
    });
    useChatStore.setState({ chats: [] });
    router.push("/login");
  };
  return (
    <div className="absolute bottom-0 left-0 w-full h-16 bg-white shadow-md">
      <button onClick={() => router.push("/profile")}>Profile</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default SidebarFooter;
