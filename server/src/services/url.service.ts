import UrlModel from '../models/url.model';
import SettingsModel from '../models/settings.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { UpdateUrlData, UrlDocument } from '../types/url.interface';
import { ApiError } from '../utils/ApiError';
import { generateTimelineData } from '../utils/generateTimelineData.utils';
import { getDateRange } from '../utils/getDateRange.utils';
import { aggregateStats, filterAnalyticsByRange, getPercentageChange, getTop } from '../utils/analytics.utils';
import QrCodeModel from '../models/qrCode.model';
import { anonymizeIp } from '../utils/anonymizeIp.utils';
import { checkUserUrlLimit } from '../utils/checkUserUrlLimit.utils';
import { sendNotification } from './sendNotifications.service';
import { Types } from 'mongoose';
const UAParser = require('ua-parser-js');

const toObjectId = (id: string) => new Types.ObjectId(id);

export const createShortUrl = async (originalUrl: string, userId?: string, customCode?: string, expiryDays?: number, clickLimit?: number,
    tags?: string[]) => {
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);
    // normalize input
    expiryDays = Number(expiryDays) || 0;
    clickLimit = Number(clickLimit) || 0;

    if (!settings.urlSettings.urlCustomization)
        throw new ApiError('URL customization is disabled by admin.', 400);

    const { urlSettings, qrSettings, userSettings } = settings;
    // Check user URL limits
    if (userId) {
        if (urlSettings.maxUrlsPerUser) await checkUserUrlLimit(userId, urlSettings.maxUrlsPerUser, 'total');
        if (userSettings.dailyUrlLimit) await checkUserUrlLimit(userId, userSettings.dailyUrlLimit, 'daily');
        if (userSettings.monthlyUrlLimit) await checkUserUrlLimit(userId, userSettings.monthlyUrlLimit, 'monthly');
    }


    // Prevent duplicate
    const existingUrl = await UrlModel.findOne({ userId, originalUrl });
    if (existingUrl)
        throw new ApiError('You already have a short URL for this original link.', 409);

    //  Generate short ID
    let shortId: string;
    if (customCode) {
        if (!urlSettings.allowCustomSlugs)
            throw new ApiError('Custom slugs are disabled by admin.', 400);

        if (customCode.length > urlSettings.defaultLength)
            throw new ApiError(
                `Slug must be ${urlSettings.defaultLength} characters or fewer.`,
                400
            );

        const existingSlug = await UrlModel.findOne({ shortId: customCode });
        if (existingSlug) throw new ApiError('Custom code already in use.', 409);
        shortId = customCode;
    } else {
        shortId = generateShortId(urlSettings.defaultLength);
    }

    const shortUrl = `${process.env.BASE_URL}/r/${shortId}`;

    // Expiration Logic
    let expiresAt: Date | undefined;

    if (expiryDays !== undefined) {
        if (!urlSettings.enableExpiration && expiryDays >= 0)
            throw new ApiError('Expiration is disabled by admin.', 400);

        const maxExpiry = urlSettings.expirationDaysLimit;

        if (expiryDays === 0) {
            expiresAt = undefined; // never expires
        } else if (maxExpiry === 0 || expiryDays <= maxExpiry) {
            expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        } else {
            throw new ApiError(
                `Max allowed expiration is ${maxExpiry} days.`,
                400
            );
        }
    }

    // Handle click limit
    let finalClickLimit: number | undefined;
    if (clickLimit && clickLimit > 0) {
        if (clickLimit > 1000) {
            throw new ApiError("Click limit cannot exceed 1000.", 400);
        }
        finalClickLimit = clickLimit;
    }

    // Tags cleanup
    const cleanTags =
        Array.isArray(tags) && tags.length
            ? [...new Set(tags.map((t) => t.trim()).filter(Boolean))]
            : [];


    // Create the URL
    const newUrl = await UrlModel.create({
        originalUrl,
        shortId,
        shortUrl,
        userId,
        expiresAt,
        clickLimit: finalClickLimit,
        tags: cleanTags,
    });

    // Generate QR
    const qrCodeUrl = await generateQRCode(shortUrl, {
        size: qrSettings.defaultSize,
        format: qrSettings.defaultFormat,
        foregroundColor: qrSettings.foregroundColor,
        backgroundColor: qrSettings.backgroundColor,
    });
    const qrCode = await QrCodeModel.create({
        urlId: newUrl._id,
        qrCodeUrl,
        format: qrSettings.defaultFormat,
        size: qrSettings.defaultSize,
        foregroundColor: qrSettings.foregroundColor,
        backgroundColor: qrSettings.backgroundColor,
    })

    newUrl.qrCode = qrCode._id;
    await newUrl.save();

    // Notify admins
    await sendNotification({
        title: " New URL Created",
        message: userId
            ? `User ${userId} created a new short link (${shortUrl}).`
            : `A guest user created a new short link (${shortUrl}).`,
        forAdmin: true,
        type: "info",
        category: "url",
    });

    // User notification
    if (userId) {
        await sendNotification({
            userId: toObjectId(userId),
            title: "Short URL Created",
            message: `Your short link (${shortUrl}) for ${originalUrl} was created successfully.`,
            type: "success",
            category: "url",
        });
    }

    return newUrl.populate('qrCode');
};

export const updateUrl = async (id: string, updateData: UpdateUrlData, userId?: string): Promise<UrlDocument> => {
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);
    if (!settings.urlSettings.urlCustomization)
        throw new ApiError('URL customization is disabled by admin.', 400);

    const { urlSettings, qrSettings, userSettings } = settings;
    // Check user URL limits
    if (userId) {
        if (urlSettings.maxUrlsPerUser) await checkUserUrlLimit(userId, urlSettings.maxUrlsPerUser, 'total');
        if (userSettings.dailyUrlLimit) await checkUserUrlLimit(userId, userSettings.dailyUrlLimit, 'daily');
        if (userSettings.monthlyUrlLimit) await checkUserUrlLimit(userId, userSettings.monthlyUrlLimit, 'monthly');
    }

    const url = await UrlModel.findOne({ _id: id, userId });
    if (!url) throw new ApiError('URL not found or access denied', 404);

    const { shortId, expiryDays, clickLimit, tags } = updateData;

    if (shortId && shortId !== url.shortId) {
        if (!urlSettings.allowCustomSlugs)
            throw new ApiError("Custom short codes are disabled by admin.", 400);

        if (shortId.length > urlSettings.defaultLength)
            throw new ApiError(
                `Custom code must be ${urlSettings.defaultLength} characters or fewer.`,
                400
            );

        const existing = await UrlModel.findOne({ shortId });
        if (existing && existing._id !== id) {
            throw new ApiError('Custom short code already in use', 409);
        }

        url.shortId = shortId;
        url.shortUrl = `${process.env.BASE_URL}/r/${shortId}`;

        const qrCodeUrl = await generateQRCode(url.shortUrl, {
            size: qrSettings.defaultSize,
            format: qrSettings.defaultFormat,
            foregroundColor: qrSettings.foregroundColor,
            backgroundColor: qrSettings.backgroundColor,
        });

        if (url.qrCode) {
            await QrCodeModel.findByIdAndUpdate(url.qrCode, {
                qrCodeUrl,
                size: qrSettings.defaultSize,
                format: qrSettings.defaultFormat,
                foregroundColor: qrSettings.foregroundColor,
                backgroundColor: qrSettings.backgroundColor,
            });
        } else {
            const qrCode = await QrCodeModel.create({
                urlId: url._id,
                qrCodeUrl,
                format: qrSettings.defaultFormat,
                size: qrSettings.defaultSize,
                foregroundColor: qrSettings.foregroundColor,
                backgroundColor: qrSettings.backgroundColor,
            });
            url.qrCode = qrCode._id;
        }

    }

    // Validate expiryDays
    if (expiryDays !== undefined) {

        if (!urlSettings.enableExpiration && expiryDays >= 0)
            throw new ApiError("Expiration feature disabled by admin.", 400);

        if (expiryDays === 0) {
            url.expiresAt = undefined;
        } else if (
            expiryDays > 0 &&
            expiryDays <= urlSettings.expirationDaysLimit
        ) {
            url.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        } else {
            throw new ApiError(
                `Expiry days must be between 0 and ${urlSettings.expirationDaysLimit}.`,
                400
            );
        }
    }

    // Validate clickLimit
    if (clickLimit !== undefined) {
        if (clickLimit === 0) {
            url.clickLimit = undefined;
        } else if (
            Number.isInteger(clickLimit) &&
            clickLimit > (url.clicks ?? 0) &&
            clickLimit <= 1000
        ) {
            url.clickLimit = clickLimit;
        } else {
            throw new ApiError(
                `Click limit must be 0 (unlimited) or greater than current clicks (${url.clicks ?? 0}) and <= 1000.`,
                400
            );
        }
    }

    //  Handle tags
    if (tags !== undefined) {
        const cleanTags = Array.isArray(tags)
            ? tags.map((t) => t.trim())
            : tags.split(",").map((t: string) => t.trim());

        url.tags = [...new Set(cleanTags.filter((t) => t))];
    }

    // Reactivate URL if possible
    const now = new Date();
    const notExpired = !url.expiresAt || url.expiresAt > now;
    const underLimit = !url.clickLimit || (url.clicks ?? 0) < url.clickLimit;
    url.isActive = notExpired && underLimit;

    const updatedUrl = await url.save();

    // Notify admins
    await sendNotification({
        title: "Short URL Updated",
        message: `User ${userId} updated short link: ${updatedUrl.shortUrl}`,
        forAdmin: true,
        type: "info",
        category: "url",
    });

    if (userId) {
        await sendNotification({
            userId: toObjectId(userId),
            title: "URL Updated",
            message: `Your short link (${updatedUrl.shortUrl}) was updated successfully.`,
            type: "success",
            category: "url",
        });
    }

    await updatedUrl.populate('qrCode');
    return updatedUrl;

};

export const getAndUpdateOriginalUrl = async (shortId: string, clientIp?: string, geo?: { country: string; region: string; city: string; timezone: string; ll: number[] }, userAgent?: string, referrer?: string) => {
    const url = await UrlModel.findOne({ shortId });
    if (!url) throw new ApiError('URL not found or access denied', 404);

    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);
    const { analyticsSettings } = settings;

    // ----  tracking settings ----
    const { trackClicks, trackLocation, trackDevice, trackReferrer, anonymizeIPs } = analyticsSettings;

    // ---- Validate URL state ----
    if (url.expiresAt && url.expiresAt < new Date()) throw new ApiError('This link has expired', 410);
    if (url.clickLimit && url.clicks >= url.clickLimit) throw new ApiError('This link has reached its click limit', 429);
    if (url.isBlocked) throw new ApiError('This link has been blocked', 403);

    let analyticsEntry: any = {
        timeStamp: new Date()
    };

    if (trackClicks) {
        // IP (possibly anonymized)
        if (clientIp) {
            analyticsEntry.ip = anonymizeIPs ? anonymizeIp(clientIp) : clientIp;
        }

        // Location info
        if (trackLocation && geo) {
            analyticsEntry.country = geo.country || 'Unknown';
            analyticsEntry.region = geo.region || 'Unknown';
            analyticsEntry.city = geo.city || 'Unknown';
            analyticsEntry.timezone = geo.timezone || 'Unknown';
            analyticsEntry.ll = geo.ll || [];
        }

        // Device info
        if (trackDevice && userAgent) {
            const parser = new UAParser(userAgent);
            analyticsEntry.browser = parser.getBrowser().name || 'Unknown';
            analyticsEntry.os = parser.getOS().name || 'Unknown';
            analyticsEntry.device = parser.getDevice().type || 'desktop';
        }

        // Referrer info
        if (trackReferrer) {
            analyticsEntry.referrer = referrer || 'Direct';
        }

        // Always store userAgent minimally
        analyticsEntry.userAgent = userAgent || 'Unknown';

        // Push analytics entry
        url.analytics.push(analyticsEntry);
    }


    if (trackClicks) {
        url.clicks += 1;

        // Auto-block logic
        if (settings.systemSettings.enableAutoCleanup) {
            const overClickLimit = url.clickLimit && url.clicks >= url.clickLimit;
            const expired = url.expiresAt && url.expiresAt < new Date();

            if (overClickLimit || expired) {
                url.isActive = false; // Block the URL immediately

                if (url.userId) {
                    const reason = overClickLimit ? 'reached its click limit' : 'expired';
                    await sendNotification({
                        userId: url.userId,
                        title: "URL Deactivated",
                        message: `Your short link (${url.shortUrl}) has been deactivated because it ${reason}.`,
                        type: "warning",
                        category: "url",
                    });
                }
            }
        }
    }
    await url.save();

    return url.populate('qrCode');
};

export const getUserUrls = async (userId?: string) => {
    if (!userId) return [];
    const urls = await UrlModel.find({ userId })
        .populate('qrCode')
        .sort({ createdAt: -1 });

    return urls;
}

export const deleteUserUrl = async (id: string, userId?: string) => {
    const deletedUrl = await UrlModel.findOneAndDelete({ _id: id, userId });
    if (!deletedUrl) throw new ApiError("URL not found or access denied", 404);
    //  Notify admins
    await sendNotification({
        title: "Short URL Deleted",
        message: `User ${userId} deleted the short link: ${deletedUrl.shortUrl}`,
        forAdmin: true,
        type: "warning",
        category: "url",
    });

    //  Notify user
    if (userId) {
        await sendNotification({
            userId: toObjectId(userId),
            title: "URL Deleted",
            message: `Your short link (${deletedUrl.shortUrl}) was deleted successfully.`,
            type: "info",
            category: "url",
        });
    }

    return deletedUrl;

};

export const getUrlById = async (id: string, range: string) => {
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError("Settings not found", 500);
    const { analyticsSettings } = settings;

    const url = await UrlModel.findById(id).populate('qrCode');
    if (!url) throw new ApiError('URL not found or access denied', 404);

    const retentionDays = analyticsSettings.dataRetention ?? 0;
    const now = new Date();
    let retentionStart: Date | undefined = undefined;
    if (retentionDays > 0) {
        retentionStart = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
    }

    let analytics = url.analytics || [];
    const { currentFromDate, currentToDate, previousFromDate, previousToDate } = getDateRange(range, now);

    if (retentionStart) {
        analytics = analytics.filter(a => new Date(a.timestamp) >= retentionStart);
    }

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