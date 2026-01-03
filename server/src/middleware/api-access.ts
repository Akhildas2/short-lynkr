import { Request, Response, NextFunction } from "express";
import SettingsModel from "../models/settings.model";
import { ApiError } from "../utils/ApiError";

/**
 * ============================
 * API ACCESS CONTROL MIDDLEWARE
 * ============================
 */

/**
 * API access guard
 */
export const apiAccessMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalUrl = req.originalUrl;

    // Allow critical and whitelisted routes
    if (originalUrl.startsWith('/api/admin') || originalUrl.startsWith('/api/auth/login') || originalUrl.startsWith('/api/user/me')) return next();

    // Fetch system settings
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError("Settings not found", 500);

    const { systemSettings } = settings;

    // Block API access when globally disabled
    if (!systemSettings.enableApiAccess) {
        res.status(403).json({ message: "API access is disabled" });
        return;
    }
    next();
};