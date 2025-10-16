import { BaseAnalyticsData } from "../base-analytics-data/base-analytics.interface";
import { User } from "../user/user.model";

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

export interface QrCode {
    _id: string;
    urlId: string;
    qrCodeUrl: string;
    format: "PNG" | "SVG" | "JPEG";
    size: number;
    foregroundColor: string;
    backgroundColor: string;
    createdAt: Date;
}

export interface UrlEntry extends BaseAnalyticsData {
    _id: string;
    originalUrl: string;
    shortId: string;
    shortUrl: string;
    userId: User;
    clicks: number;
    expiryDays: number;
    clickLimit: number;
    tags: string[];
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isBlocked: boolean;

    qrCode?: QrCode;
    uniqueVisitors?: number;
    topCountry?: string;
    topCountryPercentage?: number;
    countryClicks?: Record<string, number>;
}