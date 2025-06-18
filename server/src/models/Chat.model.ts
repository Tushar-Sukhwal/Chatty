import mongoose, { Schema, Document } from "mongoose";
import { IChatDocument } from "../types/models";

const ChatSchema = new Schema<IChatDocument>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    name: {
      type: String,
      required: function (this: IChatDocument) {
        return this.type === "group";
      },
    },
    description: {
      type: String,
    },
    avatar: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        lastSeen: {
          type: Date,
          default: Date.now, //when the user last saw the chat
        },
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChatDocument>("Chat", ChatSchema);
