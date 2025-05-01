import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';

export const createShortUrl = async (longUrl: string, userId?: string) => {
    const shortId = generateShortId();
    const shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    const qrCodeUrl = await generateQRCode(shortUrl);

    const newUrl = await UrlModel.create({ longUrl, shortId, shortUrl, qrCodeUrl, userId });
    return newUrl;
};

export const getOriginalUrl = async (shortId: string) => {
    return await UrlModel.findOne({ shortId });
};

export const getUserUrls = async (userId: string) => {
    return await UrlModel.find({ userId }).sort({ createdAt: -1 });
}