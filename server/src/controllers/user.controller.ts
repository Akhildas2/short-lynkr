import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import User from '../models/user.model';
import Urls from '../models/url.model';
import { comparePassword, hashPassword } from '../utils/password';

/**
 * ============================
 * USER PROFILE CONTROLLER
 * ============================
 */

/**
 * Get authenticated user profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        // Fetch user without exposing password
        const user = await User.findById(userId).select('-password');;
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }

        // Fetch all URLs created by the user
        const urls = await Urls.find({ userId })

        // Aggregate statistics
        const totalUrls = urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0)

        // Calculate unique visitors using IP tracking
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



/**
 * Edit user profile details
 */
export const editProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email } = req.body;
        const userId = req.user?.id;

        // Validate input
        if (!username || !email) {
            res.status(400).json({ message: 'Username and email are required.' });
            return;
        }

        // Update profile information
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


/**
 * Change account password
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        // Validate request body
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Both current and new passwords are required.' });
            return;
        }

        // Fetch user with password field
        const user = await User.findById(userId);
        if (!user || !user.password) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Verify current password
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Current password is incorrect.' });
            return;
        }

        // Hash and update new password
        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
}


/**
 * Delete user account
 */
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        // Remove all URLs associated with the user
        await Urls.deleteMany({ userId });

        // Delete user account
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