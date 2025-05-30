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

        if (existing && existing._id !== id) {
            throw new ApiError('Custom short code already in use', 409);
        }

        url.shortId = shortId;
        url.shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    }

    if (expiryDays !== undefined && expiryDays > 0) {
        url.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    } else {
        url.expiresAt = undefined;
    }

    if (clickLimit !== undefined) {
        url.clickLimit = clickLimit;
    } else {
        url.clickLimit = undefined;
    }

    if (tags !== undefined) {
        const cleanTags = Array.isArray(tags)
            ? tags.map(tag => tag.trim())
            : tags.split(',').map((tag: string) => tag.trim());

        // Remove empty and duplicate tags
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
    if (url.expiresAt && url.expiresAt < new Date()) {
        throw new ApiError('This link has expired', 410);
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