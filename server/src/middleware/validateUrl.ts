import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * ============================
 * URL VALIDATION MIDDLEWARE
 * ============================
 */
export const validateUrl = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { originalUrl } = req.body;

    // Check if URL is provided
    if (!originalUrl) {
        res.status(400).json({ error: 'URL is required' });
        return
    }

    // Validate URL format and protocol
    if (!validator.isURL(originalUrl, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true
    })) {
        res.status(400).json({ error: 'Invalid URL format. Must include http/https.' });
        return;
    }

    // URL is valid, proceed to next middleware/controller
    next();
};