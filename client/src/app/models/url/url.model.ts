export interface UrlEntry {
    _id: string;
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    qrCodeUrl: string;
    userId: string;
    clicks: number;
    customDomain?: string;
    expiryDays: number;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}