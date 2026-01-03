import { Document } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    role: string;
    password: string;
    isBlocked?: boolean;
}

export interface UserDocument extends Document {
    username: string;
    email: string;
    googleId:string;
    password: string;
    role: string;
    isEmailVerified: boolean;
    isActive: boolean;
    otp?: string | null;
    otpExpiresAt?: Date | null;
    isBlocked: boolean;
    blockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}