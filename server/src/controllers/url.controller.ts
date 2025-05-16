import { Request, Response, NextFunction } from 'express';
import * as urlService from '../services/url.service';
import { AuthRequest } from '../types/auth';

export const createUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { originalUrl, expiryDays } = req.body;
        const userId = req.user?.id;

        if (!originalUrl) {
            res.status(400).json({ message: 'Original URL is required' });
            return;
        }

        const urlData = await urlService.createShortUrl(originalUrl, userId, expiryDays);
        res.status(201).json(urlData);

    } catch (error) {
        next(error);
    }
};

export const redirectToOriginal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { shortId } = req.params;
        console.log("req", req.params)
        const urlData = await urlService.getAndUpdateOriginalUrl(shortId);
        if (!urlData) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }

        res.redirect(urlData.originalUrl);

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
        const url = await urlService.getUrlById(id);
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