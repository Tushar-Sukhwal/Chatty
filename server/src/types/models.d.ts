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
  status: string;
  deletedFor: Schema.Types.ObjectId[];
  deletedForEveryone: boolean;
  replyTo: Schema.Types.ObjectId;
  sentAt: Date;
  // deliveredAt?: Date;
  readAt?: Date;
  editedAt?: Date;
}

export declare interface IUserDocument extends Document {
  _id: Schema.Types.ObjectId;
  email: string;
  userName: string;
  avatar?: string;
  lastSocketConnectedAt: Date;
  chats: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
}
