export interface User {
  name: string;
  _id: string;
  email: string;
  userName: string;
  avatar?: string;
  lastSocketConnectedAt: Date;
  chats: Chat[];
  friends: User[];
}

export interface Chat {
  _id: string;
  type: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  participants: { user: User; lastSeen: Date }[];
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}
