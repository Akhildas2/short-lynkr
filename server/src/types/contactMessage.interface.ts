import { Document } from "mongoose";

export interface IContactMessage extends Document {
    inquiryId: string;

    name: string;
    phoneNumber: number;
    email: string;
    subject: string;
    message: string;

    ipAddress?: string;
    device?: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
    platform?: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown';
    userAgent?: string;

    isRead: boolean;
    status: 'active' | 'pending' | 'closed';

    createdAt?: Date;
    updatedAt?: Date;
}