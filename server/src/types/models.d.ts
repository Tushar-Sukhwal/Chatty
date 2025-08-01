import { Document, Schema } from "mongoose";

export declare interface IChatDocument extends Document {
  _id: Schema.Types.ObjectId;
  type: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: Schema.Types.ObjectId;
  participants: {
    user: Schema.Types.ObjectId;
    lastSeen: Date;
  }[];
  lastMessage: Schema.Types.ObjectId;
  lastMessageAt: Date;
  messages: Schema.Types.ObjectId[];
}

export declare interface IMessageDocument extends Document {
  _id?: Schema.Types.ObjectId;
  messageId?: string; // uuid4
  chatId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  type: string;
  // File attachment fields
  file?: {
    url?: string;
    publicId?: string;
    originalName?: string;
    size?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  status: string;
  deletedFor: Schema.Types.ObjectId[];
  deletedForEveryone: boolean;
  replyTo: string;
  sentAt: Date;
  // deliveredAt?: Date;
  readAt?: Date;
  editedAt?: Date;
  isEdited: boolean;
}

export declare interface IUserDocument extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  userName: string;
  avatar?: string;
  lastSocketConnectedAt: Date;
  chats: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
}
