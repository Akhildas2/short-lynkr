import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { getMaintenanceStatus } from "../services/maintenance.service";

export const maintenanceMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const maintenanceMode = await getMaintenanceStatus();

        // Always allow admin routes or login
        if (req.originalUrl.startsWith("/api/admin") || req.originalUrl.startsWith("/admin")) return next();

        // Allow all if not in maintenance
        if (!maintenanceMode) return next();

        // Allow admin access
        if (req.user?.role === "admin") return next();

        // Allow user to see own profile
        if (req.user?.role === "user" && req.originalUrl.startsWith("/api/user/me")) return next();

        // Block all other API routes
        if (req.originalUrl.startsWith("/api")) {
            res.status(503).json({ message: "Site is under maintenance" });
            return;
        }

        // Redirect frontend routes
        return res.redirect(`${process.env.CLIENT_URL}/maintenance`);
    } catch (err) {
        next(err);
    }
};