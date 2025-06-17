import mongoose, { Schema, Document } from 'mongoose';

interface IParticipantDocument extends Document {
  chatId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: string;
  joinedAt: Date;
  unreadCount: number;
  lastReadMessageId: Schema.Types.ObjectId;
}

const ParticipantSchema = new Schema<IParticipantDocument>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  lastReadMessageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
});

ParticipantSchema.index({ chatId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IParticipantDocument>('Participant', ParticipantSchema);
