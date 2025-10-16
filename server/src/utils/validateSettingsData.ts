import { ISettings } from "../types/settings.interface";
import { ApiError } from "./ApiError";

export const validateSettingsData = (settingsData: Partial<ISettings>): void => {
    // -------------------
    // URL Settings
    // -------------------
    if (settingsData.urlSettings) {
        const { defaultLength, maxUrlsPerUser, maxClickPerUrl, expirationDaysLimit } = settingsData.urlSettings;

        if (defaultLength !== undefined && (defaultLength < 6 || defaultLength > 12)) {
            throw new ApiError('Default URL length must be between 6 and 12 characters', 400);
        }

        if (maxUrlsPerUser !== undefined && (maxUrlsPerUser < 1 || maxUrlsPerUser > 1000)) {
            throw new ApiError('Max URLs per user must be between 1 and 1000', 400);
        }

        if (maxClickPerUrl !== undefined && (maxClickPerUrl < 1 || maxClickPerUrl > 10000)) {
            throw new ApiError('Max click per user must be between 1 and 10000', 400);
        }

        if (expirationDaysLimit !== undefined && (expirationDaysLimit < 0 || expirationDaysLimit > 365)) {
            throw new ApiError('Expiration days must be between 0 and 365', 400);
        }
    }

    // -------------------
    // QR Settings Validation
    // -------------------
    if (settingsData.qrSettings) {
        const { defaultSize, allowedSizes, defaultFormat, allowedFormat, foregroundColor, backgroundColor } = settingsData.qrSettings;

        // Validate defaultSize
        const validSizes = [300, 500, 750, 1024];
        if (defaultSize !== undefined && !validSizes.includes(defaultSize)) {
            throw new ApiError(
                `QR code default size must be one of: ${validSizes.join(', ')}`,
                400
            );
        }

        // Validate allowedSizes
        if (allowedSizes) {
            if (!Array.isArray(allowedSizes)) {
                throw new ApiError('allowedSizes must be an array of numbers', 400);
            }
            const invalidSizes = allowedSizes.filter(
                size => !validSizes.includes(size)
            );
            if (invalidSizes.length > 0) {
                throw new ApiError(
                    `allowedSizes contains invalid values: ${invalidSizes.join(', ')}`,
                    400
                );
            }
        }

        // Validate defaultFormat
        const validFormats = ['PNG', 'SVG', 'JPEG'] as const;
        if (defaultFormat && !validFormats.includes(defaultFormat as any)) {
            throw new ApiError(
                `Invalid QR code format. Allowed formats: ${validFormats.join(', ')}`,
                400
            );
        }

        // Validate allowedFormat
        if (allowedFormat) {
            if (!Array.isArray(allowedFormat)) {
                throw new ApiError('allowedFormat must be an array of strings', 400);
            }
            const invalidFormats = allowedFormat.filter(
                f => !validFormats.includes(f as any)
            );
            if (invalidFormats.length > 0) {
                throw new ApiError(
                    `allowedFormat contains invalid values: ${invalidFormats.join(', ')}`,
                    400
                );
            }
        }

        // Validate colors
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (foregroundColor && !colorRegex.test(foregroundColor)) {
            throw new ApiError('Invalid foreground color format', 400);
        }
        if (backgroundColor && !colorRegex.test(backgroundColor)) {
            throw new ApiError('Invalid background color format', 400);
        }
    }

    // -------------------
    // Analytics Settings
    // -------------------
    if (settingsData.analyticsSettings) {
        const { dataRetention } = settingsData.analyticsSettings;
        if (dataRetention !== undefined && (dataRetention < 0 || dataRetention > 365)) {
            throw new ApiError('Analytics data retention must be between 0 and 365 days', 400);
        }
    }

    // -------------------
    // User Settings
    // -------------------
    if (settingsData.userSettings) {
        const { dailyUrlLimit, monthlyUrlLimit } = settingsData.userSettings;

        if (dailyUrlLimit !== undefined && (dailyUrlLimit < 1 || dailyUrlLimit > 100)) {
            throw new ApiError('Daily URL limit must be between 1 and 100', 400);
        }

        if (monthlyUrlLimit !== undefined && (monthlyUrlLimit < 1 || monthlyUrlLimit > 1000)) {
            throw new ApiError('Monthly URL limit must be between 1 and 1000', 400);
        }

        // Validate that daily is not greater than monthly
        if (
            dailyUrlLimit !== undefined &&
            monthlyUrlLimit !== undefined &&
            dailyUrlLimit > monthlyUrlLimit
        ) {
            throw new ApiError('Daily URL limit cannot be greater than Monthly URL limit', 400);
        }
    }
    // -------------------
    // System Settings
    // -------------------
    if (settingsData.systemSettings) {
        const { supportEmail, cacheDuration, rateLimit } = settingsData.systemSettings;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (supportEmail && !emailRegex.test(supportEmail)) {
            throw new ApiError('Invalid support email format', 400);
        }

        if (cacheDuration !== undefined && (cacheDuration < 1 || cacheDuration > 1440)) {
            throw new ApiError('Cache duration must be between 1 and 1440 minutes (24 hours)', 400);
        }

        if (rateLimit !== undefined && (rateLimit < 1 || rateLimit > 10000)) {
            throw new ApiError('Rate limit must be between 1 and 10,000 requests per minute', 400);
        }
    }


};