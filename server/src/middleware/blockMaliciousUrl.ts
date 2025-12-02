import { Request, Response, NextFunction } from "express";
import SettingsModel from "../models/settings.model";
import { ApiError } from "../utils/ApiError";
import fetch from "node-fetch";

export const blockMaliciousUrlMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const settings = await SettingsModel.findOne();
        if (!settings) throw new ApiError("Settings not found", 500);

        const { securitySettings } = settings;
        const { originalUrl } = req.body;

        if (!securitySettings.blockMaliciousUrls) return next();
        if (!originalUrl) return next();

        // Validate URL format
        let urlObj: URL;
        try {
            urlObj = new URL(originalUrl);
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                res.status(400).json({ message: "Only HTTP/HTTPS URLs allowed." });
                return;
            }
        } catch {
            res.status(400).json({ message: "Invalid URL format." });
            return;
        }

        // Local quick malicious keyword checks
        const maliciousPatterns = [
            /phishing/i,
            /malware/i,
            /virus/i,
            /hack/i,
            /porn/i,
            /scam/i,
            /fraud/i,
        ];

        if (maliciousPatterns.some((p) => p.test(originalUrl))) {
            res.status(400).json({ message: "Unsafe URL content detected." });
            return;
        }

        // PhishTank API check
        const phishCheckUrl = `https://checkurl.phishtank.com/checkurl/?url=${encodeURIComponent(
            originalUrl
        )}&format=json`;

        let response;
        try {
            response = await fetch(phishCheckUrl);
        } catch (err) {
            return next(); // Do not block URL if API fails
        }

        // Check if the response is JSON
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            return next();
        }

        // Safe JSON parsing
        let data: any;
        try {
            data = await response.json();
        } catch (err) {
            return next();
        }

        // Phishing confirmed
        if (
            data?.results?.in_database &&
            data.results.verified &&
            data.results.valid
        ) {
            res.status(400).json({
                message: "This URL is marked as phishing or unsafe by PhishTank.",
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};