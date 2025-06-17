import mongoose, { Schema, Document } from 'mongoose';

interface IUserDocument extends Document {
  email: string;
  userName: string;
  password: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  lastSocketConnectedAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
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
    default: '',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  lastSocketConnectedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});



export default mongoose.model<IUserDocument>('User', UserSchema);
