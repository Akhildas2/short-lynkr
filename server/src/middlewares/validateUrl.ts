import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateUrl = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { url } = req.body;

    if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return
    }

    if (!validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true
    })) {
        res.status(400).json({ error: 'Invalid URL format. Must include http/https.' });
        return;
    }

    next();
};