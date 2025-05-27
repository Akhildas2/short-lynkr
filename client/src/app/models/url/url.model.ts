export interface UrlEntry {
    _id: string;
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    qrCodeUrl: string;
    userId: string;
    clicks: number;
    expiryDays: number;
    clickLimit: number;
    tags: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}