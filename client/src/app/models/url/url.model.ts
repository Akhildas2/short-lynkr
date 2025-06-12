export interface AnalyticsEntry {
    ip: string;
    country: string;
    userAgent: string;
    referrer: string;
    browser: string;
    os: string;
    device: string;
    timestamp: Date;
}


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
    tags: string[];
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    analytics?: AnalyticsEntry[];

    uniqueVisitors?: number;
    topCountry?: string;
    topCountryPercentage?: number;
    clicksChange?: number;
    visitorsChange?: number;
    timelineData?: number[];
    timelineLabels?: string[];
}