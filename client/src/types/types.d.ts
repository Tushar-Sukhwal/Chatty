export interface Chat {
  _id: string;
  type: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  participants: {
    user: string;
    lastSeen: Date;
  }[];
  lastMessage: string;
  lastMessageAt: Date;
  messages: string[];
}

export interface Message {
  _id?: string; // mongo id
  messageId: string; // uuid4
  chatId: string;
  senderId: string;
  content: string;
  type: string; // text, image, file, audio, video, location, contact, etc.
  status: string; // sent, delivered, read, edited, deleted, etc.
  replyTo: string; // message id
  sentAt: Date; // date and time when the message was sent
  readAt: Date; // date and time when the message was read (only for direct chats)
  editedAt: Date; // date and time when the message was edited
}

export interface User {
  _id: string; // mongo id
  email: string;
  userName: string;
  avatar?: string;
  lastSocketConnectedAt: Date;
  chats: string[];
  friends: string[];
}
