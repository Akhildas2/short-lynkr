import { Document } from "mongoose";

export interface SocialQrCodeDocument extends Document {
    platform: string;          // whatsapp, telegram, instagram
    accountUrl: string;        // social profile link
    qrCodeUrl: string;
    format: 'PNG' | 'SVG' | 'JPEG';
    size: number;
    foregroundColor: string;
    backgroundColor: string;
}