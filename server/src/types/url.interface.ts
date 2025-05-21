import { Document, Types } from 'mongoose';

export interface UrlDocument extends Document {
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    qrCodeUrl?: string;
    customDomain?: string;
    userId?: Types.ObjectId;
    clicks: number;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUrlData {
  customDomain?: string;
  shortId?: string;    
  expiryDays?: number;
}