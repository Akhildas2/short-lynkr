import { Request, Response, NextFunction } from 'express';
import * as urlService from '../services/url.service';
import { AuthRequest } from '../types/auth';
import geoip from 'geoip-lite';

export const createUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { originalUrl } = req.body;
        const userId = req.user?.id;

        if (!originalUrl) {
            res.status(400).json({ message: 'Original URL is required' });
            return;
        }

        const urlData = await urlService.createShortUrl(originalUrl, userId);
        const io = req['io'];
        io?.emit('urlCreated', urlData)
        res.status(201).json(urlData);

    } catch (error) {
        next(error);
    }
};

export const updateUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { customCode, expiryDays, clickLimit, tags } = req.body;
        const userId = req.user?.id;

        // Input validation
        if (!customCode) {
            res.status(400).json({ message: 'Custom short code is required.' });
            return;
        }

        if (customCode && customCode.length > 8) {
            res.status(400).json({ message: 'Custom short code must be 8 characters or fewer.' });
            return;
        }

        const updatedUrl = await urlService.updateUrl(id, {
            shortId: customCode,
            expiryDays,
            clickLimit,
            tags
        }, userId);
        res.status(200).json({ url: updatedUrl });

    } catch (error) {
        next(error);
    }
};

export const redirectToOriginal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { shortId } = req.params;
        const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
        const geo = geoip.lookup(clientIp.toString());
        const country = geo?.country || 'Unknown';
        const userAgent = req.get('User-Agent') || 'Unknown';
        const referrer = req.get('Referer') || 'Direct';

        const urlData = await urlService.getAndUpdateOriginalUrl(shortId, clientIp.toString(), country, userAgent, referrer);
        if (!urlData) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }

        const io = req['io'];
        io?.emit("urlUpdated", {
            id: urlData._id,
            clicks: urlData.clicks
        })

        res.status(200).json({ originalUrl: urlData.originalUrl, urlData });

    } catch (error) {
        next(error);
    }
};

export const getUserUrls = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Invalid or expired authentication token.' });
            return;
        }

        const urls = await urlService.getUserUrls(userId);
        res.status(200).json({ urls });

    } catch (error) {
        next(error);
    }
}

export const getUrlById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const range = (req.query.range as string);

        const url = await urlService.getUrlById(id, range);
        if (!url) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }

        res.status(200).json({ url });

    } catch (error) {
        next(error);
    }
}


export const deleteUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

        const userId = req.user?.id;
        const { id } = req.params;

        const deletedUrl = await urlService.deleteUserUrl(id, userId);
        if (!deletedUrl) {
            res.status(404).json({ message: 'URL not found or unauthorized' });
            return;
        }

        res.status(200).json({ message: 'URL deleted successfully' });

    } catch (error) {
        next(error);
    }
}