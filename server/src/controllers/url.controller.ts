import { Request, Response, NextFunction } from 'express';
import { UrlService } from '../services/url.service';


export class UrlController {
    static async shortenUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const { url } = req.body;
            const urlEntry = await UrlService.createShortUrl(url);

            res.status(201).json({
                shortUrl: `${req.protocol}://${req.get('host')}/${urlEntry.shortId}`,
                originalUrl: urlEntry.originalUrl,
                clicks: urlEntry.clicks
            });
        } catch (error) {
            next(error);
        }
    }

    static async redirectUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const { shortId } = req.params;
            const originalUrl = await UrlService.getOriginalUrl(shortId);
            res.redirect(originalUrl);
        } catch (error) {
            next(error);
        }
    }
}