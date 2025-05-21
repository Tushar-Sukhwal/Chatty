type GroupChatType = {
  id: string;
  user_id: number;
  title: string;
  passcode: string;
  is_group: boolean;
  share_link?: string;
  created_at: string;
  is_owner?: boolean;
};

type GroupChatUserType = {
  id: number;
  name: string;
  group_id: string;
  user_id: number;
  created_at: string;
  is_owner: boolean;
  isOnline?: boolean;
  user?: UserType;
};

type MessageType = {
  id: string;
  message: string;
  group_id?: string;
  direct_chat_id?: string;
  name: string;
  file?: string;
  created_at: string;
};

type UserType = {
  id: number;
  name: string;
  email: string;
  image?: string;
  isOnline?: boolean;
};

type DirectChatType = {
  id: string;
  otherUser: UserType;
  created_at: string;
};

type TypingStatusType = {
  users: string[];
  roomId: string;
};

type ChatType = "group" | "direct";

type UserStatusType = {
  userId: string;
  status: "online" | "offline";
};
