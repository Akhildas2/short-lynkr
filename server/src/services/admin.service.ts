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
        return await User.find().select('-password').lean();
    },

    async createUser(data: Partial<IUser>) {
        const existing = await User.findOne({ email: data.email });
        if (existing) throw new ApiError('User already exists.', 409);

        const user = new User(data);
        await user.save();
        return user.toObject();
    },

    async updateUser(userId: UserId, data: Partial<IUser>) {
        const user = await User.findByIdAndUpdate(userId, data, { new: true });
        if (!user) throw new ApiError('User not found', 404);
        return user.toObject();
    },

    async toggleBlockUser(userId: UserId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError('User not found', 404);

        user.isBlocked = !user.isBlocked;
        await user.save();
        return user.toObject();
    },

    async deleteUser(userId: UserId) {
        const result = await User.findByIdAndDelete(userId);
        if (!result) throw new ApiError('User not found', 404);
        return result.toObject();
    },

    // ===== URLS =====
    async getAllUrls() {
        return await Urls.find().populate('userId', 'username email').lean();
    },

    async toggleBlockUrl(urlId: UrlId) {
        const url = await Urls.findById(urlId);
        if (!url) throw new ApiError('URL not found', 404);

        url.isBlocked = !url.isBlocked;
        await url.save();
        return url.toObject();
    },

    async deleteUrl(urlId: UrlId) {
        const result = await Urls.findByIdAndDelete(urlId);
        if (!result) throw new ApiError('URL not found', 404);
        return result.toObject();
    }
};

export default AdminService;