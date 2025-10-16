import mongoose, { Schema } from "mongoose";
import { ISettings } from "../types/settings.interface";

const settingsSchema = new Schema<ISettings>({
    urlSettings: {
        defaultLength: { type: Number, default: 8, min: 6, max: 12 },
        allowCustomSlugs: { type: Boolean, default: true },
        expirationDaysLimit: { type: Number, default: 365, min: 0, max: 365 },
        maxUrlsPerUser: { type: Number, default: 1000, min: 1, max: 1000 },
        maxClickPerUrl: { type: Number, default: 10000, min: 1, max: 10000 },
        enableExpiration: { type: Boolean, default: true },
        urlCustomization: { type: Boolean, default: true }
    },

    qrSettings: {
        defaultSize: { type: Number, enum: [300, 500, 750, 1024], default: 300 },
        allowedSizes: { type: [Number], default: [300, 500, 750, 1024] },
        defaultFormat: { type: String, enum: ['PNG', 'SVG', 'JPEG'], default: 'PNG' },
        allowedFormat: { type: [String], default: ['PNG', 'SVG', 'JPEG'] },
        foregroundColor: { type: String, default: '#000000' },
        backgroundColor: { type: String, default: '#FFFFFF' },
    },

    analyticsSettings: {
        trackClicks: { type: Boolean, default: true },
        trackLocation: { type: Boolean, default: true },
        trackDevice: { type: Boolean, default: true },
        trackReferrer: { type: Boolean, default: true },
        dataRetention: { type: Number, default: 365, min: 0, max: 365 },
        anonymizeIPs: { type: Boolean, default: true }
    },

    userSettings: {
        allowRegistration: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: true },
        moderateNewUsers: { type: Boolean, default: false },
        dailyUrlLimit: { type: Number, default: 100, min: 1, max: 100 },
        monthlyUrlLimit: { type: Number, default: 1000, min: 1, max: 1000 }
    },

    systemSettings: {
        appName: { type: String, default: 'Short-Lynkr' },
        supportEmail: { type: String, default: 'shortLynkrSupport@example.com' },
        maintenanceMode: { type: Boolean, default: false },
        enableApiAccess: { type: Boolean, default: true },
        cacheDuration: { type: Number, default: 60 },
        rateLimit: { type: Number, default: 100 },
        themeMode: { type: String, default: "light" }
    },

    notificationSettings: {
        emailAlerts: { type: Boolean, default: true },
        dailyReports: { type: Boolean, default: false },
        securityAlerts: { type: Boolean, default: true }
    },

    securitySettings: {
        enforceHttps: { type: Boolean, default: true },
        enableTwoFactor: { type: Boolean, default: false },
        blockMaliciousUrls: { type: Boolean, default: true },
        enableGdprCompliance: { type: Boolean, default: false },
        cookieConsent: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', settingsSchema)