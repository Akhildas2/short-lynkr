import { getUserUrls } from '../controllers/url.controller';
import Urls from '../models/url.model';
import User from '../models/user.model';
import { IUser } from '../types/user.interface';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

type UserId = string | Types.ObjectId;
type UrlId = string | Types.ObjectId;

const AdminService = {
    // ===== USERS =====
    async getAllUsers() {
        return await User.find().select('-password'); // don’t return passwords
    },

    async createUser(data: Partial<IUser>) {
        const existing = await User.findOne({ email: data.email });
        if (existing) throw new ApiError('User already exists.', 409);

        const user = new User(data);
        return await user.save();
    },

    async updateUser(userId: UserId, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(userId, data, { new: true });
    },

    async toggleBlockUser(userId: UserId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError('User not found', 404);

        user.isBlocked = !user.isBlocked;
        await user.save();

        return { success: true, isBlocked: user.isBlocked };
    },

    async deleteUser(userId: UserId) {
        return await User.findByIdAndDelete(userId)
    },

    // ===== URLS =====
    async getAllUrls() {
        return await Urls.find().populate('user', 'name email');
    },

    async toggleBlockUrl(urlId: UrlId) {
        const url = await Urls.findById(urlId);
        if (!url) throw new Error('URL not found');
        url.isBlocked = !url.isBlocked;
        await url.save();
        return { success: true, isBlocked: url.isBlocked };
    },

    async deleteUrl(urlId: UrlId) {
        return await Urls.findByIdAndDelete(urlId);
    },

}

export default AdminService;