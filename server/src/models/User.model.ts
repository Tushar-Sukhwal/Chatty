import mongoose, { Schema, Document } from "mongoose";
import { IUserDocument } from "../types/models";

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    lastSocketConnectedAt: {
      type: Date,
    },
    chats: {
      type: [Schema.Types.ObjectId],
      ref: "Chat",
    },
    friends: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserDocument>("User", UserSchema);
