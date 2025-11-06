import mongoose from 'mongoose';
import { UserDocument } from '../types/user.interface';

const userSchema = new mongoose.Schema<UserDocument>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    googleId: { type: String, unique: true, sparse: true },
    password: { type: String, required: function (this: any) { return !this.googleId } },
    role: { type: String, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    lastLoginAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<UserDocument>('User', userSchema);
