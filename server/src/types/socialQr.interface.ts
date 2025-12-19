import { Document, Types } from "mongoose";

export interface SocialQrCodeDocument extends Document {
    platform: string;          // whatsapp, telegram, instagram
    accountUrl: string;        // social profile link
    userId?: Types.ObjectId;
    size: number;
    format: 'PNG' | 'SVG' | 'JPEG';
    foregroundColor: string;
    backgroundColor: string;
    qrCodeUrl: string;
    createdAt: Date;
    updatedAt: Date;
}