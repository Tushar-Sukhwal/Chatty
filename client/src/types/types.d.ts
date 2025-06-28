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
  createdAt?: Date;
}

export interface FileAttachment {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
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
  replyTo?: string; //message id
  deletedForEveryone?: boolean;
  type?: "text" | "image" | "file" | "video" | "audio" | "document";
  file?: FileAttachment;
}
