import { Document, Types } from 'mongoose';

export interface Analytics {
  ip: string;
  country: string;
  userAgent: string;
  referrer: string;
  browser: string;
  os: string;
  device: string;
  timestamp: Date;
}

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
  isActive: boolean;
  analytics: Analytics[];
  isBlocked: boolean;
}

export interface UpdateUrlData {
  shortId?: string;
  expiryDays?: number;
  clickLimit?: number;
  tags?: string;
}