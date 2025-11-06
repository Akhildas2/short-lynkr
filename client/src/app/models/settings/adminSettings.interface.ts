export interface AdminSettings {
    urlSettings: {
        defaultLength: number;
        allowCustomSlugs: boolean;
        expirationDaysLimit: number;
        maxUrlsPerUser: number;
        maxClickPerUrl: number;
        enableExpiration: boolean;
        urlCustomization: boolean;
    };
    qrSettings: {
        defaultSize: 300 | 500 | 750 | 1024;
        allowedSizes: number[];
        defaultFormat: 'PNG' | 'SVG' | 'JPEG';
        allowedFormat: ('PNG' | 'SVG' | 'JPEG')[];
        foregroundColor: string;
        backgroundColor: string;
    };
    analyticsSettings: {
        trackClicks: boolean;
        trackLocation: boolean;
        trackDevice: boolean;
        trackReferrer: boolean;
        dataRetention: number;
        anonymizeIPs: boolean;
    };
    userSettings: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        moderateNewUsers: boolean;
        dailyUrlLimit: number;
        monthlyUrlLimit: number;
    };
    notificationSettings: {
        emailAlerts: boolean;
        dailyReports: boolean;
        securityAlerts: boolean;
    };
    securitySettings: {
        enforceHttps: boolean;
        enableTwoFactor: boolean;
        blockMaliciousUrls: boolean;
    };
    systemSettings: {
        appName: string;
        supportEmail: string;
        maintenanceMode: boolean;
        maintenanceStart?: Date | null;
        maintenanceEnd?: Date | null;
        enableApiAccess: boolean;
        enableAutoCleanup: boolean;
        themeMode: string;
    };
}