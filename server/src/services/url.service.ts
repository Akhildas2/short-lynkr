import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { UpdateUrlData, UrlDocument } from '../types/url.interface';

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
        throw new Error('URL not found or access denied');
    }

    const { customDomain, shortId, expiryDays } = updateData;

    if (customDomain !== undefined) {
        url.customDomain = customDomain;
    }

    if (shortId !== undefined && shortId !== url.shortId) {
        const existing = await UrlModel.findOne({ shortId });

        if (existing && existing._id !== id) {
            throw new Error('Custom short code already in use');
        }

        url.shortId = shortId;
    }
    const domain=url.customDomain?.trim();
    url.shortUrl = `${process.env.BASE_URL}/r/${shortId}`;

    if (expiryDays !== undefined && expiryDays > 0) {
        url.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    }

    await url.save();
    return url;
};


export const getAndUpdateOriginalUrl = async (shortId: string) => {
    const url = await UrlModel.findOne({ shortId });

    if (!url || (url.expiresAt && url.expiresAt < new Date())) {
        return null;
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