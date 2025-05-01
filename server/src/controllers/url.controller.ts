import { Request, Response, NextFunction } from 'express';
import * as urlService from '../services/url.service';
import { AuthRequest } from '../types/auth';

export const createUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { longUrl } = req.body;
        const userId = req.user?._id;

        if (!longUrl) {
            res.status(400).json({ message: 'Long URL is required' });
            return;
        }

        const urlData = await urlService.createShortUrl(longUrl, userId);
        res.status(201).json(urlData);

    } catch (error) {
        next(error);
    }
};

export const redirectToOriginal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { shortId } = req.params;
        const urlData = await urlService.getOriginalUrl(shortId);
        if (!urlData) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }
        res.redirect(urlData.longUrl);

    } catch (error) {
        next(error);
    }
};


export const getUserUrls = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Invalid or expired authentication token.' });
            return;
        }

        const urls = await urlService.getUserUrls(userId)
        res.status(200).json({ urls });

    } catch (error) {
        next(error);
    }
}