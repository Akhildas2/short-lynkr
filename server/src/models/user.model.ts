import mongoose from 'mongoose';
import { UserDocument } from '../types/user.interface';

const userSchema = new mongoose.Schema<UserDocument>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    lastLoginAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<UserDocument>('User', userSchema);
