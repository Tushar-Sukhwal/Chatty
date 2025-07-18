import mongoose, { Schema } from "mongoose";
import { IMessageDocument } from "../types/models";

const MessageSchema = new Schema<IMessageDocument>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    }, //uuid4
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "video", "audio", "document"],
      default: "text",
    },
    // File attachment fields
    file: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      originalName: {
        type: String,
      },
      size: {
        type: Number,
      },
      mimeType: {
        type: String,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      duration: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: String, // uuid 4
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessageDocument>("Message", MessageSchema);
