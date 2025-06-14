import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { UpdateUrlData, UrlDocument } from '../types/url.interface';
import { ApiError } from '../utils/ApiError';
import { groupAnalyticsByRange } from '../utils/analytics';
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


export const getAndUpdateOriginalUrl = async (shortId: string, clientIp?: string, country?: string, userAgent?: string, referrer?: string) => {
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

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'desktop';

    if (userAgent) {
        const parser = new UAParser(userAgent);
        browser = parser.getBrowser().name || 'Unknown';
        os = parser.getOS().name || 'Unknown';
        device = parser.getDevice().type || 'desktop';
    }

    if (clientIp && country) {
        url.analytics.push({
            ip: clientIp,
            country,
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
    if (!url) {
        throw new ApiError('URL not found or access denied', 404);
    }
    console.log("range", range)

    const now = new Date();
    const rangeMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
    const days = rangeMap[range] ?? 7;
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const analytics = (url.analytics || []).filter(a => new Date(a.timestamp) >= fromDate);

    const totalClicks = analytics.length;
    const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;

    // Top country
    const countryCounts = analytics.reduce((acc, { country }) => {
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];
    const topCountry = sortedCountries?.[0] || 'Unknown';
    const topCountryCount = sortedCountries?.[1] || 0;
    const topCountryPercentage = totalClicks > 0
        ? ((topCountryCount / totalClicks) * 100).toFixed(1)
        : '0.0';

    // Time calculations
    const oneDay = 24 * 60 * 60 * 1000;

    // Clicks changes
    const todayClicks = analytics.filter(a => new Date(a.timestamp) >= new Date(now.getTime() - oneDay)).length;
    const yesterdayClicks = analytics.filter(a => {
        const time = new Date(a.timestamp).getTime();
        return time >= now.getTime() - 2 * oneDay && time < now.getTime() - oneDay;
    }).length;
    const clicksChange = yesterdayClicks > 0
        ? (((todayClicks - yesterdayClicks) / yesterdayClicks) * 100).toFixed(2)
        : '100.00';

    // Visitors changes
    const todayVisitors = new Set(
        analytics.filter(a => new Date(a.timestamp) >= new Date(now.getTime() - oneDay)).map(a => a.ip)
    ).size;
    const yesterdayVisitors = new Set(
        analytics.filter(a => {
            const time = new Date(a.timestamp).getTime();
            return time >= now.getTime() - 2 * oneDay && time < now.getTime() - oneDay;
        }).map(a => a.ip)
    ).size;

    const visitorsChange = yesterdayVisitors > 0
        ? (((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100).toFixed(2)
        : '100.00';

    const { labels: timelineLabels, data: timelineData } = groupAnalyticsByRange(analytics, range);
    console.log("timelineLabels",timelineLabels);
    console.log("timelineData",timelineData);

    
    return {
        ...url.toObject(),
        clicks: totalClicks,
        uniqueVisitors,
        topCountry,
        topCountryPercentage: parseFloat(topCountryPercentage),
        clicksChange: parseFloat(clicksChange),
        visitorsChange: parseFloat(visitorsChange),
        timelineLabels,
        timelineData
    };
};