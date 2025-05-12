export interface UrlEntry {
    _id: string;
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    qrCodeUrl: string;
    userId: string;
    click: number;
    customDomain?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UrlCreateRequest {
    originalUrl: string;
    customCode?: string;
    customDomain?: string;
    expiryDays?: number;
}

export interface UrlStatsResponse {
    totalClicks: number;
    dailyClicks: { date: string; count: number }[];
    browserStats: { name: string; count: number }[];
    deviceStats: { type: string; count: number }[];
    locationStats: { country: string; count: number }[];
}

export interface QrCodeOptions {
    backgroundColor?: string;
    foregroundColor?: string;
    cornerColor?: string;
    logo?: string;
    size?: number;
}