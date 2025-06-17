import mongoose, { Schema, Document } from 'mongoose';

interface IChatDocument extends Document {
  type: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: Schema.Types.ObjectId;
  participants: string[];
  lastMessage: Schema.Types.ObjectId;
  lastMessageAt: Date;
}

const ChatSchema = new Schema<IChatDocument>({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  name: {
    type: String,
    required: function(this: IChatDocument) {
      return this.type === 'group';
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
    ref: 'User',
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IChatDocument>('Chat', ChatSchema);
