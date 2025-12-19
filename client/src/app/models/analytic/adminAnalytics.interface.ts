import { BaseAnalyticsData } from "../base-analytics-data/base-analytics.interface";

export interface AdminAnalytics extends BaseAnalyticsData {
    totalUrls: number;
    blockedUrls: number;
    totalUsers: number;
    blockedUsers: number;
    totalQrs: number;
    totalClicks: number;
    uniqueVisitors: number;

    urlTimeline?: { labels: string[]; data: number[] };
    userTimeline?: { labels: string[]; data: number[] };
    clickTimeline?: { labels: string[]; data: number[] };

    combinedTimeline?: {
        labels: string[];
        users: number[];
        blockedUsers: number[];
        urls: number[];
        blockedUrls: number[];
        qrs: number[];
    };

    topUrls: { shortUrl: string; originalUrl: string; clicks: number }[];
}

export interface StatItem {
    name: string;
    value: number;
    percentage: number;
    fullName?: string;
}

export type TimeRangeKey = '1d' | '7d' | '30d' | '90d';