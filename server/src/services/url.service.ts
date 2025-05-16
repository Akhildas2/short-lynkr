import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';

export const createShortUrl = async (originalUrl: string, userId?: string, expiryDays?: number) => {
    const shortId = generateShortId();
    const shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    const qrCodeUrl = await generateQRCode(shortUrl);

    const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined;

    const newUrl = await UrlModel.create({
        originalUrl,
        shortId,
        shortUrl,
        qrCodeUrl,
        userId,
        expiresAt
    });

    return newUrl;
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