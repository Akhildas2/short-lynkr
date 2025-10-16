import { Types } from "mongoose";

export interface QrCodeDocument extends Document {
    urlId?: Types.ObjectId;           // Reference to Url
    qrCodeUrl: string;                 // Generated QR code image URL or base64
    format: 'PNG' | 'SVG' | 'JPEG';    // QR format
    size: number;                      // QR size in px
    foregroundColor: string;           // QR foreground color
    backgroundColor: string;           // QR background color
}