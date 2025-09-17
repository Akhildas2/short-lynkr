import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { UpdateUrlData, UrlDocument } from '../types/url.interface';
import { ApiError } from '../utils/ApiError';
import { generateTimelineData } from '../utils/generateTimelineData.utils';
import { getDateRange } from '../utils/getDateRange.utils';
import { aggregateStats, filterAnalyticsByRange, getPercentageChange, getTop } from '../utils/analytics.utils';
const UAParser = require('ua-parser-js');


export const createShortUrl = async (originalUrl: string, userId?: string) => {
    const existingUrl = await UrlModel.findOne({ userId, originalUrl });
    if (existingUrl) {
        throw new ApiError('Short URL already exists for this original URL.', 409);
    }

    const shortId = generateShortId();
    const shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    const qrCodeUrl = await generateQRCode(shortUrl);

    const newUrl = await UrlModel.create({
        originalUrl,
        shortId,
        shortUrl,
        qrCodeUrl,
        userId,
    });

    return newUrl;
};

export const updateUrl = async (id: string, updateData: UpdateUrlData, userId?: string): Promise<UrlDocument> => {
    const url = await UrlModel.findOne({ _id: id, userId });

    if (!url) {
        throw new ApiError('URL not found or access denied', 404);
    }

    const { shortId, expiryDays, clickLimit, tags } = updateData;
    let expiryUpdated = false;
    let clickLimitUpdated = false;

    if (shortId !== undefined && shortId !== url.shortId) {
        const existing = await UrlModel.findOne({ shortId });

        if (existing?.id && existing._id !== id) {
            throw new ApiError('Custom short code already in use', 409);
        }

        url.shortId = shortId;
        url.shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    }

    // Validate expiryDays
    if (expiryDays !== undefined) {
        expiryUpdated = true;
        if (Number.isInteger(expiryDays) && expiryDays > 0 && expiryDays <= 100) {
            url.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        } else {
            url.expiresAt = undefined;
        }
    }

    // Validate clickLimit
    if (clickLimit !== undefined) {
        clickLimitUpdated = true;
        const currentClicks = url.clicks ?? 0;

        if (clickLimit === 0) {
            url.clickLimit = undefined;
        } else if (
            Number.isInteger(clickLimit) &&
            clickLimit > currentClicks &&
            clickLimit <= 1000
        ) {
            url.clickLimit = clickLimit;
        } else {
            throw new ApiError(
                `Click limit must be 0 (unlimited) or greater than current clicks (${currentClicks}) and less than or equal to 1000.`,
                400
            );
        }
    }

    // Validate  tags
    if (tags !== undefined) {
        const cleanTags = Array.isArray(tags)
            ? tags.map(tag => tag.trim())
            : tags.split(',').map((tag: string) => tag.trim());

        url.tags = [...new Set(cleanTags.filter(tag => tag))];
    }

    if (!url.isActive && (expiryUpdated || clickLimitUpdated)) {
        const now = new Date();

        const notExpired = !url.expiresAt || url.expiresAt > now;
        const notOverLimit =
            !url.clickLimit || (url.clicks ?? 0) < url.clickLimit;

        if (notExpired && notOverLimit) {
            url.isActive = true;
        }
    }

    await url.save();
    return url;
};


export const getAndUpdateOriginalUrl = async (shortId: string, clientIp?: string, geo?: { country: string; region: string; city: string; timezone: string; ll: number[] }, userAgent?: string, referrer?: string) => {
    const url = await UrlModel.findOne({ shortId });
    if (!url) {
        throw new ApiError('URL not found or access denied', 404);
    }
    // Check expiration
    if (url.expiresAt && url.expiresAt < new Date()) {
        throw new ApiError('This link has expired', 410);
    }
    // Check click limit
    if (url.clickLimit && url.clicks >= url.clickLimit) {
        throw new ApiError('This link has reached its click limit', 429);
    }
    // Check if URL is blocked
    if (url.isBlocked) {
        throw new ApiError('This link has been blocked', 403);
    }

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'desktop';

    if (userAgent) {
        const parser = new UAParser(userAgent);
        browser = parser.getBrowser().name || 'Unknown';
        os = parser.getOS().name || 'Unknown';
        device = parser.getDevice().type || 'desktop';
    }

    if (clientIp && geo) {
        url.analytics.push({
            ip: clientIp,
            country: geo.country,
            region: geo.region,
            city: geo.city,
            timezone: geo.timezone,
            ll: geo.ll,
            userAgent: userAgent || 'Unknown',
            referrer: referrer || 'Direct',
            browser,
            os,
            device,
            timestamp: new Date()
        });
    }

    url.clicks += 1;
    await url.save();

    return url;
};

export const getUserUrls = async (userId?: string) => {
    return await UrlModel.find({ userId }).sort({ createdAt: -1 });
}

export const deleteUserUrl = async (id: string, userId?: string) => {
    return await UrlModel.findOneAndDelete({ _id: id, userId });
};

export const getUrlById = async (id: string, range: string) => {
    const url = await UrlModel.findById(id);
    if (!url) throw new ApiError('URL not found or access denied', 404);

    const now = new Date();
    const { currentFromDate, currentToDate, previousFromDate, previousToDate } = getDateRange(range, now);

    const analytics = url.analytics || [];
    const currentAnalytics = filterAnalyticsByRange(analytics, currentFromDate, currentToDate);
    const previousAnalytics = filterAnalyticsByRange(analytics, previousFromDate, previousToDate);

    // --- Current & Previous ---
    const totalClicks = currentAnalytics.length;
    const uniqueVisitors = new Set(currentAnalytics.map(a => a.ip)).size;
    const previousClicks = previousAnalytics.length;
    const previousVisitors = new Set(previousAnalytics.map(a => a.ip)).size;

    const clicksChange = getPercentageChange(totalClicks, previousClicks);
    const visitorsChange = getPercentageChange(uniqueVisitors, previousVisitors);

    // --- Stats ---
    const countryStats = aggregateStats(currentAnalytics, 'country', 'Unknown');
    const cityStats = aggregateStats(currentAnalytics, 'city', 'Unknown');
    const referrerStats = aggregateStats(currentAnalytics, 'referrer', 'Direct');
    const deviceStats = aggregateStats(currentAnalytics, 'device', 'Unknown');
    const browserStats = aggregateStats(currentAnalytics, 'browser', 'Unknown');
    const osStats = aggregateStats(currentAnalytics, 'os', 'Unknown');

    // --- Region stats ---
    const regionStats = currentAnalytics.reduce((acc: Record<string, number>, a) => {
        const country = a.country || 'Unknown';
        const region = a.region || 'Unknown';
        const key = `${country}|${region}`; // combine country + region
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // --- Timeline ---
    const { timelineLabels, timelineData } = generateTimelineData(
        currentAnalytics.map(a => ({ timestamp: a.timestamp })),
        range
    );

    return {
        ...url.toObject(),
        clicks: totalClicks,
        uniqueVisitors,
        clicksChange,
        visitorsChange,
        topCountries: getTop(countryStats, 5),
        topRegions: getTop(regionStats, 5),
        topCities: getTop(cityStats, 5),
        topReferrers: getTop(referrerStats, 5),
        topDevices: getTop(deviceStats, 5),
        topBrowsers: getTop(browserStats, 5),
        topOS: getTop(osStats, 5),
        timeline: {
            labels: timelineLabels,
            data: timelineData
        }
    };
};