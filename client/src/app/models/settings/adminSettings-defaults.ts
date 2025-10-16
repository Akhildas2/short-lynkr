import { AdminSettings } from "./adminSettings.interface";

export const defaultAdminSettings: AdminSettings = {
    urlSettings: {
        defaultLength: 8,
        allowCustomSlugs: true,
        expirationDaysLimit: 365,
        maxUrlsPerUser: 1000,
        maxClickPerUrl: 10000,
        enableExpiration: true,
        urlCustomization: true
    },

    qrSettings: {
        defaultSize: 300,
        allowedSizes: [300, 500, 750, 1024],
        defaultFormat: 'PNG',
        allowedFormat: ['PNG', 'SVG', 'JPEG'],
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
    },

    analyticsSettings: {
        trackClicks: true,
        trackLocation: true,
        trackDevice: true,
        trackReferrer: true,
        dataRetention: 30,
        anonymizeIPs: true
    },

    userSettings: {
        allowRegistration: true,
        requireEmailVerification: true,
        moderateNewUsers: false,
        dailyUrlLimit: 100,
        monthlyUrlLimit: 1000
    },

    notificationSettings: {
        emailAlerts: true,
        dailyReports: false,
        securityAlerts: true
    },

    securitySettings: {
        enforceHttps: true,
        enableTwoFactor: false,
        blockMaliciousUrls: true,
        enableGdprCompliance: false,
        cookieConsent: false
    },

    systemSettings: {
        appName: 'Short-Lynkr',
        supportEmail: 'shortLynkrSupport@example.com',
        maintenanceMode: false,
        enableApiAccess: true,
        cacheDuration: 60,
        rateLimit: 100,
        themeMode: 'light'
    },

};