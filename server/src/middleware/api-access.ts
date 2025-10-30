import { Request, Response, NextFunction } from "express";
import SettingsModel from "../models/settings.model";
import { ApiError } from "../utils/ApiError";

export const apiAccessMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // allow admin routes
    const originalUrl = req.originalUrl;
    if (originalUrl.startsWith('/api/admin') || originalUrl.startsWith('/api/auth/login') || originalUrl.startsWith('/api/user/me')) return next();

    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError("Settings not found", 500);

    const { systemSettings } = settings;
    if (!systemSettings.enableApiAccess) {
        res.status(403).json({ message: "API access is disabled" });
        return;
    }
    next();
};