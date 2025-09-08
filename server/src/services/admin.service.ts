import Urls from '../models/url.model';
import Users from '../models/user.model';
import { IUser } from '../types/user.interface';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';
import { hashPassword } from '../utils/password';
import { aggregateStats, filterAnalyticsByRange, getPercentageChange, getTop } from '../utils/analytics.utils';
import { generateTimelineData, Range } from '../utils/generateTimelineData.utils';
import { getDateRange } from '../utils/getDateRange.utils';

type UserId = string | Types.ObjectId;
type UrlId = string | Types.ObjectId;

const AdminService = {
    // ===== USERS =====
    async getAllUsers() {
        return await Users.find({ role: { $ne: 'admin' } }).select('-password').lean();
    },

    async createUser(data: Partial<IUser>) {
        // Check if user already exists by email
        const existing = await Users.findOne({ email: data.email });
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
        const user = new Users(data);
        await user.save();
        return user.toObject();
    },

    async updateUser(userId: UserId, data: Partial<IUser>) {
        // Prevent updating role to admin
        if (data.role === 'admin') {
            throw new ApiError('Cannot assign admin role to a user.', 400);
        }
        // Update user
        const user = await Users.findByIdAndUpdate(userId, data, { new: true });
        if (!user) throw new ApiError('User not found', 404);
        return user.toObject();
    },

    async toggleBlockUser(userId: UserId, isBlocked: boolean) {
        const user = await Users.findById(userId);
        if (!user) throw new ApiError('User not found', 404);

        user.isBlocked = isBlocked;
        user.blockedAt = isBlocked ? new Date() : null;
        await user.save();
        return user.toObject();
    },

    async deleteUser(userId: UserId) {
        const result = await Users.findByIdAndDelete(userId);
        if (!result) throw new ApiError('User not found', 404);
        return result.toObject();
    },

    // ===== URLS =====
    async getAllUrls() {
        const urls = await Urls.find().populate('userId', 'username email').lean();

        return urls.map(url => {
            const analytics = url.analytics || [];

            const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;
            const countryStats = aggregateStats(analytics, 'country', 'Unknown');
            const topCountryEntry = getTop(countryStats, 1)[0];  // returns [{ name, count }]
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

        url.isBlocked = isBlocked;
        url.blockedAt = isBlocked ? new Date() : null;
        await url.save();
        return url.toObject();
    },

    async deleteUrl(urlId: UrlId) {
        const result = await Urls.findByIdAndDelete(urlId);
        if (!result) throw new ApiError('URL not found', 404);
        return result.toObject();
    },

    // ===== Analytics =====
    async getAdminAnalytics(range: string) {
        const urls = await Urls.find().lean();
        const totalUrls = urls.length;
        const blockedUrls = urls.filter(u => u.isBlocked).length;

        const totalQrs = await Urls.countDocuments();

        const users = await Users.find().lean();
        const totalUsers = users.length;
        const blockedUsers = users.filter(u => u.isBlocked).length;

        const now = new Date();
        const { currentFromDate, currentToDate, previousFromDate, previousToDate } = getDateRange(range, now);

        let currentAnalytics: any[] = [];
        let previousAnalytics: any[] = [];

        for (const url of urls) {
            const analytics = url.analytics || [];
            const filtered = filterAnalyticsByRange(analytics, currentFromDate, currentToDate);

            // Attach shortUrl
            filtered.forEach(a => a.shortUrl = url.shortUrl);

            currentAnalytics.push(...filtered);
            previousAnalytics.push(...filterAnalyticsByRange(analytics, previousFromDate, previousToDate));
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

        // --- Region stats: must include both country + region ---
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
    }

};

export default AdminService;