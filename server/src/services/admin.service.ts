import Urls from '../models/url.model';
import User from '../models/user.model';
import SettingsModel from '../models/settings.model';
import { IUser } from '../types/user.interface';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';
import { hashPassword } from '../utils/password';
import { aggregateStats, filterAnalyticsByRange, getPercentageChange, getTop } from '../utils/analytics.utils';
import { generateTimelineData } from '../utils/generateTimelineData.utils';
import { getDateRange } from '../utils/getDateRange.utils';
import { getAverageResponseTime, getDbStorageUsed, getErrorRate } from '../middleware/metrics';
import { formatBytes } from '../utils/formatBytes';
import { applyRetention } from '../utils/applyRetention.utils';
import { sendNotification } from './sendNotifications.service';

type UserId = string | Types.ObjectId;
type UrlId = string | Types.ObjectId;

const AdminService = {
    // ===== USERS =====
    async getAllUsers() {
        return await User.find({ role: { $ne: 'admin' } }).select('-password').lean();
    },

    async createUser(data: Partial<IUser>) {
        // Check if user already exists by email
        const existing = await User.findOne({ email: data.email });
        if (existing) throw new ApiError('User already exists.', 409);

        // Prevent updating role to admin
        if (data.role === 'admin') {
            throw new ApiError('Cannot assign admin role to a new user.', 400);
        }

        // Hash password 
        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        // Create and save user
        const user = new User(data);
        await user.save();

        // Notify the user
        await sendNotification({
            userId: user.id,
            title: "Account Created",
            message: `Welcome ${user.username}! Your account has been created.`,
            type: "success",
            category: "user"
        });

        // Notify admins
        await sendNotification({
            title: "New User Registered",
            message: `${user.username} has registered.`,
            forAdmin: true,
            type: "info",
            category: "system"
        });

        return user.toObject();
    },

    async updateUser(userId: UserId, data: Partial<IUser>) {
        // Prevent updating role to admin
        if (data.role === 'admin') {
            throw new ApiError('Cannot assign admin role to a user.', 400);
        }
        // Update user
        const user = await User.findByIdAndUpdate(userId, data, { new: true });
        if (!user) throw new ApiError('User not found', 404);
        return user.toObject();
    },

    async toggleBlockUser(userId: UserId, isBlocked: boolean) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError('User not found', 404);

        user.isBlocked = isBlocked;
        user.blockedAt = isBlocked ? new Date() : null;
        await user.save();

        // Notify the user
        await sendNotification({
            userId: user.id, // use _id consistently
            title: isBlocked ? 'Account Blocked' : 'Account Unblocked',
            message: `Hello ${user.username}, your account has been ${isBlocked ? 'blocked' : 'unblocked'} by an admin.`,
            type: isBlocked ? 'warning' : 'success',
            category: 'user',
        });

        // Notify admins
        await sendNotification({
            title: `User ${user.username} (${user.email}) has been ${isBlocked ? 'blocked' : 'unblocked'}`,
            message: `Admin has ${isBlocked ? 'blocked' : 'unblocked'} the account of ${user.username} (${user.email}).`,
            forAdmin: true,
            type: 'info',
            category: 'system',
        });


        return user.toObject();
    },

    async deleteUser(userId: UserId) {
        const result = await User.findByIdAndDelete(userId);
        if (!result) throw new ApiError('User not found', 404);
        return result.toObject();
    },

    // ===== URLS =====
    async getAllUrls() {
        const urls = await Urls.find().populate('userId', 'username email').populate('qrCode').lean();

        return urls.map(url => {
            const analytics = url.analytics || [];

            const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;
            const countryStats = aggregateStats(analytics, 'country', 'Unknown');
            const topCountryEntry = getTop(countryStats, 1)[0];
            const topCountry = topCountryEntry ? topCountryEntry.name : 'N/A';

            return {
                ...url,
                uniqueVisitors,
                topCountry
            };
        });
    },

    async toggleBlockUrl(urlId: UrlId, isBlocked: boolean) {
        const url = await Urls.findById(urlId);
        if (!url) throw new ApiError('URL not found', 404);
        const user = url.userId ? await User.findById(url.userId) : null;

        url.isBlocked = isBlocked;
        url.blockedAt = isBlocked ? new Date() : null;
        await url.save();

        // Notify the user (if linked)
        if (user) {
            await sendNotification({
                userId: user.id,
                title: isBlocked ? 'URL Blocked' : 'URL Unblocked',
                message: `Hi ${user.username}, your shortened URL (${url.shortUrl}) — ${url.originalUrl} has been ${isBlocked ? 'blocked' : 'unblocked'} by an admin.`,
                type: isBlocked ? 'warning' : 'success',
                category: 'url',
            });
        }

        // Notify admins
        await sendNotification({
            title: `URL ${isBlocked ? 'Blocked' : 'Unblocked'}`,
            message: `${user ? user.username : 'Unknown User'}’s URL (${url.shortUrl}) — ${url.originalUrl} has been ${isBlocked ? 'blocked' : 'unblocked'} by an admin.`,
            forAdmin: true,
            type: 'info',
            category: 'system',
        });

        return url.toObject();
    },

    async deleteUrl(urlId: UrlId) {
        const result = await Urls.findByIdAndDelete(urlId);
        if (!result) throw new ApiError('URL not found', 404);
        return result.toObject();
    },

    // ===== Analytics =====
    async getAdminAnalytics(range: string) {
        const settings = await SettingsModel.findOne();
        if (!settings) throw new ApiError("Settings not found", 500);
        const { analyticsSettings } = settings;
        const retentionDays = analyticsSettings.dataRetention ?? 0;

        const urls = await Urls.find().lean();
        if (!urls) throw new ApiError("URL not found", 500);

        // Apply retention to each URL's analytics
        for (const url of urls) {
            url.analytics = applyRetention(url.analytics || [], retentionDays);
        }

        const totalUrls = urls.length;
        const blockedUrls = urls.filter(u => u.isBlocked).length;
        const totalQrs = await Urls.countDocuments();

        const users = await User.find({ role: 'user' }).lean();
        const totalUsers = users.length;
        const blockedUsers = users.filter(u => u.isBlocked).length;

        const now = new Date();
        const { currentFromDate, currentToDate, previousFromDate, previousToDate } = getDateRange(range, now);

        let currentAnalytics: any[] = [];
        let previousAnalytics: any[] = [];

        for (const url of urls) {
            const analytics = url.analytics || [];

            const filteredCurrent = filterAnalyticsByRange(analytics, currentFromDate, currentToDate);
            const filteredPrevious = filterAnalyticsByRange(analytics, previousFromDate, previousToDate);

            // attach shortUrl to current analytics
            filteredCurrent.forEach(a => a.shortUrl = url.shortUrl);

            currentAnalytics.push(...filteredCurrent);
            previousAnalytics.push(...filteredPrevious);
        }

        // --- Current period stats ---
        const totalClicks = currentAnalytics.length;
        const uniqueVisitors = new Set(currentAnalytics.map(a => a.ip)).size;

        // --- Previous period stats ---
        const prevClicks = previousAnalytics.length;
        const prevVisitors = new Set(previousAnalytics.map(a => a.ip)).size;

        // --- Percentage changes ---
        const clicksChange = getPercentageChange(totalClicks, prevClicks);
        const visitorsChange = getPercentageChange(uniqueVisitors, prevVisitors);

        const countryStats = aggregateStats(currentAnalytics, 'country', 'Unknown');
        const cityStats = aggregateStats(currentAnalytics, 'city', 'Unknown');
        const referrerStats = aggregateStats(currentAnalytics, 'referrer', 'Direct');
        const deviceStats = aggregateStats(currentAnalytics, 'device', 'Unknown');
        const browserStats = aggregateStats(currentAnalytics, 'browser', 'Unknown');
        const osStats = aggregateStats(currentAnalytics, 'os', 'Unknown');

        // --- Region stats ---
        const regionStats = currentAnalytics.reduce((acc: Record<string, number>, a) => {
            const country = a.country || 'Unknown';
            const region = a.region || 'Unknown';
            const key = `${country}|${region}`; // combine country + region
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // --- Top URLs (sorted by clicks in current range) ---
        const topClickedUrls = urls.map(u => {
            const filtered = filterAnalyticsByRange(u.analytics || [], currentFromDate, currentToDate);
            return { shortUrl: u.shortUrl, originalUrl: u.originalUrl, clicks: filtered.length };
        }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

        // --- Timeline (based on currentAnalytics only) ---
        const { timelineLabels, timelineData } = generateTimelineData(
            currentAnalytics.map(a => ({ timestamp: a.timestamp })), range
        );

        const currentUsers = users.filter(u => u.createdAt >= currentFromDate && u.createdAt < currentToDate);
        const currentUrls = urls.filter(u => u.createdAt >= currentFromDate && u.createdAt < currentToDate);

        const currentBlockedUsers = users.filter(u =>
            u.isBlocked && u.blockedAt && (new Date(u.blockedAt) >= currentFromDate) && (new Date(u.blockedAt) < currentToDate)
        );
        const currentBlockedUrls = urls.filter(u =>
            u.isBlocked && u.blockedAt && (new Date(u.blockedAt) >= currentFromDate) && (new Date(u.blockedAt) < currentToDate)
        );

        // create timeline data
        const { timelineLabels: combinedLabels, timelineData: usersData } = generateTimelineData(
            currentUsers.map(u => ({ timestamp: u.createdAt })), range
        );

        const { timelineData: blockedUsersData } = generateTimelineData(
            currentBlockedUsers.map(u => ({ timestamp: new Date(u.blockedAt as Date) })), range
        );

        const { timelineData: urlsData } = generateTimelineData(
            currentUrls.map(u => ({ timestamp: u.createdAt })), range
        );

        const { timelineData: blockedUrlsData } = generateTimelineData(
            currentBlockedUrls.map(u => ({ timestamp: new Date(u.blockedAt as Date) })), range
        );

        return {
            totalUsers,
            blockedUsers,
            totalUrls,
            blockedUrls,
            totalQrs,
            totalClicks,
            uniqueVisitors,
            clicksChange,
            visitorsChange,
            topCountries: getTop(countryStats, 5),
            topRegions: getTop(regionStats, 5),
            topCities: getTop(cityStats, 5),
            topReferrers: getTop(referrerStats, 5),
            topDevices: getTop(deviceStats, 5),
            topBrowsers: getTop(browserStats, 5),
            topOS: getTop(osStats, 5),
            topUrls: topClickedUrls,
            timeline: {
                labels: timelineLabels,
                data: timelineData,
            },
            combinedTimeline: {
                labels: combinedLabels,
                users: usersData,
                blockedUsers: blockedUsersData,
                urls: urlsData,
                blockedUrls: blockedUrlsData
            },
            analytics: currentAnalytics
        }
    },

    // ===== Dashboard Analytics  =====
    async getAdminDashboard(range: string) {
        const settings = await SettingsModel.findOne();
        if (!settings) throw new ApiError("Settings not found", 500);
        const { analyticsSettings } = settings;
        const retentionDays = analyticsSettings.dataRetention ?? 0;

        const now = new Date();
        const { currentFromDate, currentToDate, previousFromDate, previousToDate } = getDateRange(range, now);

        // Get all data
        const urls = await Urls.find().lean();
        const users = await User.find({ role: 'user' }).lean();

        // Apply retention to analytics
        for (const url of urls) {
            url.analytics = applyRetention(url.analytics || [], retentionDays);
        }

        // === CORE METRICS ===
        const totalUrls = urls.length;
        const totalUsers = users.length;
        const totalQrs = await Urls.countDocuments();

        // Active vs Inactive
        const activeUrls = urls.filter(u => !u.isBlocked).length;
        const blockedUrls = urls.filter(u => u.isBlocked).length;
        const activeUsers = users.filter(u => !u.isBlocked).length;
        const blockedUsers = users.filter(u => u.isBlocked).length;

        // === GROWTH METRICS ===
        const currentUsers = users.filter(u => u.createdAt >= currentFromDate && u.createdAt < currentToDate);
        const previousUsers = users.filter(u => u.createdAt >= previousFromDate && u.createdAt < previousToDate);
        const userGrowth = getPercentageChange(currentUsers.length, previousUsers.length);

        const currentUrls = urls.filter(u => u.createdAt >= currentFromDate && u.createdAt < currentToDate);
        const previousUrls = urls.filter(u => u.createdAt >= previousFromDate && u.createdAt < previousToDate);
        const urlGrowth = getPercentageChange(currentUrls.length, previousUrls.length);

        // === ENGAGEMENT METRICS ===
        let currentAnalytics: any[] = [];
        let previousAnalytics: any[] = [];

        for (const url of urls) {
            const analytics = url.analytics || [];
            const currentFiltered = filterAnalyticsByRange(analytics, currentFromDate, currentToDate);
            const previousFiltered = filterAnalyticsByRange(analytics, previousFromDate, previousToDate);

            currentAnalytics.push(...currentFiltered);
            previousAnalytics.push(...previousFiltered);
        }

        const totalClicks = currentAnalytics.length;
        const prevClicks = previousAnalytics.length;
        const clicksGrowth = getPercentageChange(totalClicks, prevClicks);

        const uniqueVisitors = new Set(currentAnalytics.map(a => a.ip)).size;
        const prevVisitors = new Set(previousAnalytics.map(a => a.ip)).size;
        const visitorsGrowth = getPercentageChange(uniqueVisitors, prevVisitors);

        // Average clicks per URL
        const avgClicksPerUrl = activeUrls > 0 ? (totalClicks / activeUrls).toFixed(1) : 0;
        const avgClicksPerUser = activeUsers > 0 ? (totalClicks / activeUsers).toFixed(1) : 0;

        // === TOP PERFORMERS ===
        const topUrls = urls.map(u => {
            const filtered = filterAnalyticsByRange(u.analytics || [], currentFromDate, currentToDate);
            return {
                shortUrl: u.shortUrl,
                originalUrl: u.originalUrl,
                clicks: filtered.length,
                createdAt: u.createdAt,
                userId: u.userId
            };
        }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

        // Top Users by URL count and activity
        const userActivity = users.filter(user => user.role !== "admin").map(user => {
            const userUrls = urls.filter(u => u.userId?.toString() === user._id.toString());
            const userClicks = userUrls.reduce((sum, url) => {
                const clicks = filterAnalyticsByRange(url.analytics || [], currentFromDate, currentToDate);
                return sum + clicks.length;
            }, 0);

            return {
                id: user._id,
                email: user.email,
                name: user.username,
                urlCount: userUrls.length,
                totalClicks: userClicks,
                isActive: !user.isBlocked,
                joinDate: user.createdAt,
                lastActive: user.lastLoginAt || user.updatedAt
            };
        }).sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);

        const storageSize = await getDbStorageUsed();

        // === SYSTEM HEALTH ===
        const systemHealth = {
            uptime: process.uptime(),
            errorRate: getErrorRate().toFixed(2),
            responseTime: getAverageResponseTime().toFixed(2),
            storageUsed: formatBytes(storageSize)
        };

        // === RECENT ACTIVITY SUMMARY ===
        const recentActivity = {
            newUsers: currentUsers.length,
            newUrls: currentUrls.length,
            totalInteractions: totalClicks,
            blockedItems: blockedUsers + blockedUrls
        };

        // === TIMELINE DATA FOR CHARTS ===
        const { timelineLabels, timelineData: clicksTimeline } = generateTimelineData(
            currentAnalytics.map(a => ({ timestamp: a.timestamp })), range
        );

        const { timelineData: usersTimeline } = generateTimelineData(
            currentUsers.map(u => ({ timestamp: u.createdAt })), range
        );

        const { timelineData: urlsTimeline } = generateTimelineData(
            currentUrls.map(u => ({ timestamp: u.createdAt })), range
        );

        // === GEOGRAPHICAL INSIGHTS ===
        const countryStats = aggregateStats(currentAnalytics, 'country', 'Unknown');
        const topCountries = getTop(countryStats, 5);

        return {
            // === OVERVIEW METRICS ===
            overview: {
                totalUsers,
                activeUsers,
                blockedUsers,
                totalUrls,
                activeUrls,
                blockedUrls,
                totalQrs,
                totalClicks,
                uniqueVisitors
            },

            // === GROWTH INDICATORS ===
            growth: {
                userGrowth,
                urlGrowth,
                clicksGrowth,
                visitorsGrowth,
                newUsersThisPeriod: currentUsers.length,
                newUrlsThisPeriod: currentUrls.length
            },

            // === ENGAGEMENT METRICS ===
            engagement: {
                avgClicksPerUrl,
                avgClicksPerUser,

                clickThroughRate: activeUrls > 0 ? ((totalClicks / activeUrls) * 100).toFixed(2) : "0",
                userEngagementRate: totalUsers > 0 ? ((uniqueVisitors / totalUsers) * 100).toFixed(2) : "0"
            },

            // === TOP PERFORMERS ===
            topPerformers: {
                urls: topUrls,
                users: userActivity
            },

            // === TIMELINE CHARTS ===
            timeline: {
                labels: timelineLabels,
                datasets: [
                    { label: 'Clicks', data: clicksTimeline, borderColor: '#3b82f6' },
                    { label: 'New Users', data: usersTimeline, borderColor: '#10b981' },
                    { label: 'New URLs', data: urlsTimeline, borderColor: '#f59e0b' }
                ]
            },

            // === GEOGRAPHICAL DATA ===
            geography: {
                topCountries,
                totalCountries: Object.keys(countryStats).length
            },

            // === SYSTEM HEALTH ===
            systemHealth,

            // === RECENT ACTIVITY ===
            recentActivity,

            // === RETENTION DATA ===
            retention: {
                activeUsersLast30Days: users.filter(u => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo;
                }).length,
                returningUsers: users.filter(u => u.lastLoginAt && u.lastLoginAt !== u.createdAt).length
            }
        };
    }

};



export default AdminService;