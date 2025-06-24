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
  chatId: string;
  messageId: string;
  _id?: string;
  content: string;
  senderId: string;
  receiverId?: string;
  createdAt?: Date;
  isEdited?: boolean;
  replyToMessageId?: string; //message id
}
