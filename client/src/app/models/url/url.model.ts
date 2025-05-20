export interface UrlEntry {
    _id: string;
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    qrCodeUrl: string;
    userId: string;
    clicks: number;
    customDomain?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}