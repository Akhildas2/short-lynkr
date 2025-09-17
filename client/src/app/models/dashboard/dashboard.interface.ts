export interface DashboardData {
    overview: {
        totalUsers: number;
        activeUsers: number;
        blockedUsers: number;
        totalUrls: number;
        activeUrls: number;
        blockedUrls: number;
        totalQrs: number;
        totalClicks: number;
        uniqueVisitors: number;
    };
    growth: {
        userGrowth: number;
        urlGrowth: number;
        clicksGrowth: number;
        visitorsGrowth: number;
        newUsersThisPeriod: number;
        newUrlsThisPeriod: number;
    };
    engagement: {
        avgClicksPerUrl: number;
        avgClicksPerUser: number;
        clickThroughRate: string;
        userEngagementRate: string;
    };
    topPerformers: {
        urls: any[];
        users: any[];
    };
    timeline: {
        labels: string[];
        datasets: any[];
    };
    geography: {
        topCountries: any[];
        totalCountries: number;
    };
    systemHealth: {
        uptime: number;
        errorRate: number;
        responseTime: number;
        storageUsed: number;
    };
    recentActivity: {
        newUsers: number;
        newUrls: number;
        totalInteractions: number;
        blockedItems: number;
    };
    retention: {
        activeUsersLast30Days: number;
        returningUsers: number;
    };
}