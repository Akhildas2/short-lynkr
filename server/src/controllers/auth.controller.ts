import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Username, email, and password are required.' });
            return;
        }

        const result = await authService.registerUser(username, email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, mode } = req.body;
        if (!token || !mode) {
            res.status(400).json({ message: 'Google token and mode are required.' });
            return;
        }

        if (mode !== 'register' && mode !== 'login') {
            res.status(400).json({ message: 'Invalid mode. Must be "register" or "login".' });
            return;
        }

        const result = await authService.googleAuthenticate(token, mode);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: 'Email and OTP are required.' });
            return;
        }

        const result = await authService.verifyEmailOtp(email, otp);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required.' });
            return;
        }

        const result = await authService.resendEmailOtp(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required.' });
            return;
        }

        const result = await authService.sendForgotPasswordOtp(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ message: 'Email, OTP, and new password are required.' });
            return;
        }

        const result = await authService.resetPasswordWithOtp(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const otpRemainingTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email = req.query.email as string;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const result = await authService.getOtpRemainingTime(email);
        res.status(200).json(result);

    } catch (error: any) {
        next(error);
    }
};