import { Document, Types } from 'mongoose';

export interface UrlDocument extends Document {
  originalUrl: string;
  shortId: string;
  shortUrl: string;
  qrCodeUrl?: string;
  userId?: Types.ObjectId;
  clicks: number;
  clickLimit?: number;
  tags?: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: Boolean;
}

export interface UpdateUrlData {
  shortId?: string;
  expiryDays?: number;
  clickLimit?: number;
  tags?: string;
}