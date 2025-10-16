import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import settingsModel from '../models/settings.model';
import { comparePassword, hashPassword } from '../utils/password';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Fetch settings
        const settings = await settingsModel.findOne();
        if (!settings) throw new ApiError('Settings not found', 500);

        const { userSettings } = settings;
        const { allowRegistration, requireEmailVerification, moderateNewUsers } = userSettings;

        // --- Registration allowed check ---
        if (!allowRegistration) {
            res.status(403).json({ message: 'User registration is disabled by admin.' });
            return
        }

        // Validate required fields
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Username, email, and password are required.' });
            return
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return
        }

        // Hash password
        const hashedPassword = await hashPassword(password);
        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        res.status(201).json({ user, token });

    } catch (error) {
        next(error);
    }
}


export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return
        }

        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account has been blocked. Please contact support for assistance.' });
            return;
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );
        const { password: _, ...userData } = user.toObject();
        res.status(200).json({ user: userData, token });

    } catch (error) {
        next(error);
    }
}