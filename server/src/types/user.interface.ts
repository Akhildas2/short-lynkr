import { Document, Types } from 'mongoose';

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
    password: string;
    role: string;
    isBlocked: boolean;
    blockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}