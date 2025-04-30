import { Request, Response, NextFunction } from 'express';
import * as urlService from '../services/url.service';

export const createUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { longUrl } = req.body;
        if (!longUrl) {
            res.status(400).json({ message: 'Long URL is required' });
            return;
        }

        const urlData = await urlService.createShortUrl(longUrl);
        res.status(201).json(urlData);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const redirectToOriginal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { shortId } = req.params;
        const urlData = await urlService.getOriginalUrl(shortId);
        if (!urlData) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }
        res.redirect(urlData.longUrl);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
