export interface ISettings extends Document {
    // URL Settings
    urlSettings: {
        defaultLength: number;
        allowCustomSlugs: boolean;
        enableExpiration: boolean;
        expirationDaysLimit: number;
        maxUrlsPerUser: number;
        maxClickPerUrl: number;
        allowUrlCreation: boolean;
        urlCustomization: boolean;
    };

    // QR Settings
    qrSettings: {
        defaultSize: 300 | 500 | 750 | 1024;
        allowedSizes: number[];
        defaultFormat: 'PNG' | 'SVG' | 'JPEG';
        allowedFormat: ('PNG' | 'SVG' | 'JPEG')[];
        foregroundColor: string;
        backgroundColor: string;
    };

    // Analytics Settings
    analyticsSettings: {
        trackClicks: boolean;
        trackLocation: boolean;
        trackDevice: boolean;
        trackReferrer: boolean;
        dataRetention: number;
        anonymizeIPs: boolean;
    };

    // User Settings
    userSettings: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        moderateNewUsers: boolean;
        dailyUrlLimit: number;
        monthlyUrlLimit: number;
    };

    // Notification Settings
    notificationSettings: {
        emailAlerts: boolean;
        dailyReports: boolean;
        securityAlerts: boolean;
    };

    // Security Settings
    securitySettings: {
        enforceHttps: boolean;
        enableTwoFactor: boolean;
        blockMaliciousUrls: boolean;
        enableGdprCompliance: boolean;
        cookieConsent: boolean;
    };

    // System Settings
    systemSettings: {
        appName: string;
        supportEmail: string;
        maintenanceMode: boolean;
        enableApiAccess: boolean;
        enableAutoCleanup: boolean;
        themeMode: string;
        maintenanceStart: Date | null;
        maintenanceEnd: Date | null;
    };

}