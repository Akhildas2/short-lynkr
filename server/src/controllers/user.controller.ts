import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import User from '../models/user.model';
import Urls from '../models/url.model';
import { comparePassword, hashPassword } from '../utils/password';


export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).select('-password');;
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }
        const urls = await Urls.find({ userId })

        const totalUrls = urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0)
        const uniqueIps = new Set<string>();
        urls.forEach(url => {
            url.analytics.forEach(analytic => {
                uniqueIps.add(analytic.ip);
            });
        });
        const uniqueVisitors = uniqueIps.size;

        res.status(200).json({
            user, stats: {
                totalUrls,
                totalClicks,
                uniqueVisitors
            },
            isBlocked: user.isBlocked
        });

    } catch (error) {
        next(error);
    }
}

export const editProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email } = req.body;
        const userId = req.user?.id;

        if (!username || !email) {
            res.status(400).json({ message: 'Username and email are required.' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId, { username, email },
            { new: true, runValidators: true }
        );
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({ user });

    } catch (error) {
        next(error);
    }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Both current and new passwords are required.' });
            return;
        }

        const user = await User.findById(userId);
        if (!user || !user.password) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Current password is incorrect.' });
            return;
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
        next(error);
    }
}


export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        await Urls.deleteMany({ userId });

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({ message: 'Account deleted successfully.' });

    } catch (error) {
        next(error);
    }
}