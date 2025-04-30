import UrlModel from '../models/url.model';
import { generateShortId } from '../utils/shortIdGenerator';
import { generateQRCode } from '../utils/qrCodeGenerator';

export const createShortUrl = async (longUrl: string) => {
    const shortId = generateShortId();
    const shortUrl = `${process.env.BASE_URL}/r/${shortId}`;
    const qrCodeUrl = await generateQRCode(shortUrl);

    const newUrl = await UrlModel.create({ longUrl, shortId, shortUrl, qrCodeUrl });
    return newUrl;
};

export const getOriginalUrl = async (shortId: string) => {
    return await UrlModel.findOne({ shortId });
};