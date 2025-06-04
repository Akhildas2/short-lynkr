import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { UpdateUrlData, UrlDocument } from '../types/url.interface';
import { ApiError } from '../utils/ApiError';


export const createShortUrl = async (originalUrl: string, userId?: string) => {
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
        if (Number.isInteger(expiryDays) && expiryDays > 0 && expiryDays < 100) {
            url.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        } else {
            url.expiresAt = undefined;
        }
    }

    // Validate clickLimit
    if (clickLimit !== undefined) {
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


    await url.save();
    return url;
};


export const getAndUpdateOriginalUrl = async (shortId: string) => {
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
        throw new ApiError('This link has reached its click limit', 429); // 429 Too Many Requests
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

export const getUrlById = async (id: string) => {
    return await UrlModel.findById(id)
}