import User from '../models/user.model';
import SettingsModel from '../models/settings.model';
import { comparePassword, hashPassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';
import { generateOtp } from '../utils/otp.utils';
import { sendEmail } from '../utils/email.utils';
import { sendVerificationOtp } from '../utils/sendVerificationOtp.utils';
import { generateToken } from '../utils/generateToken.utils';
import { createUser } from '../utils/createUser.utils';
import { OAuth2Client } from 'google-auth-library';
import { sendNotification } from './sendNotifications.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (username: string, email: string, password: string) => {
    // Fetch global settings
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);

    const { allowRegistration, requireEmailVerification, moderateNewUsers } = settings.userSettings;
    const { appName } = settings.systemSettings;
    if (!allowRegistration) throw new ApiError('User registration is disabled by admin.', 403);

    // Check existing user
    let user = await User.findOne({ email });

    if (user) {
        // Already verified
        if (user.isEmailVerified) throw new ApiError('Email already registered', 400);

        // Email verification required → resend OTP
        if (requireEmailVerification) {
            await sendVerificationOtp(user);
            return { message: 'Email already registered but not verified. A new OTP has been sent.', requireEmailVerification: true, isActive: false };
        }

        // If verification not required, activate user
        user.isEmailVerified = true;
        user.isActive = !moderateNewUsers;
        await user.save();

        if (!user.isActive) {
            // Notify admins
            await sendNotification({
                title: "New User Pending Approval",
                message: `${user.username} just registered on ${appName} and is awaiting admin approval.`,
                forAdmin: true,
                type: "info",
                category: "user",
            });

            return {
                message: "Registration successful. Awaiting admin approval before login.",
                requireEmailVerification: false,
                isActive: false
            };
        }

        // Auto-login if active
        const token = generateToken(user);
        const { password: _, ...userData } = user.toObject();
        // Notify admins
        await sendNotification({
            title: "New User Joined",
            message: ` ${user.username} just joined ${appName}.`,
            forAdmin: true,
            type: "success",
            category: "user",
        });

        // Notify user
        await sendNotification({
            userId: user.id,
            title: 'Welcome!',
            message: `Welcome to ${appName}, ${user.username}!`,
            type: 'success',
            category: 'user'
        });

        return { message: "Logged in successfully.", user: userData, token, requireEmailVerification: false, isActive: true };
    }

    // Create new user
    user = await createUser(username, email, password, requireEmailVerification, moderateNewUsers);

    if (requireEmailVerification) {
        await sendVerificationOtp(user);
        return { message: 'Registration successful. Please check your email for a verification OTP.', requireEmailVerification: true, isActive: false };
    }

    await user.save();

    if (!user.isActive) {
        // Notify admins
        await sendNotification({
            title: "New User Registered",
            message: `${user.username} has joined ${appName} (Awaiting admin approval).`,
            forAdmin: true,
            type: "info",
            category: "user"
        });

        return {
            message: "Registration successful. Awaiting admin approval before login.",
            requireEmailVerification: false,
            isActive: false
        };
    }

    // Notify admins
    await sendNotification({
        title: "New User Registered",
        message: `${user.username} has joined ${appName}.`,
        forAdmin: true,
        type: "info",
        category: "user"
    });

    // Notify user
    await sendNotification({
        userId: user.id,
        title: 'Welcome!',
        message: `Welcome to ${appName}, ${user.username}!`,
        type: 'success',
        category: 'user'
    });

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    return { message: 'Registration successful. Logged in successfully.', user: userData, token, requireEmailVerification: false, isActive: true };
};

export const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError('Invalid credentials', 400);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new ApiError('Invalid credentials', 400);

    if (user.isBlocked) throw new ApiError('Your account has been blocked. Please contact support.', 403);
    if (!user.isEmailVerified) throw new ApiError('Please verify your email before logging in.', 403);
    if (!user.isActive) throw new ApiError('Your account is pending admin approval.', 403);

    user.lastLoginAt = new Date();
    await user.save();

    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);

    if (settings.notificationSettings.securityAlerts && user.role !== 'admin') {
        // Send a login notification
        await sendEmail({
            to: user.email,
            subject: 'New Login Detected',
            text: `Hi ${user.username}, a login to your account was just detected at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`,
            html: `<p>Hi ${user.username},</p><p>A login to your account was just detected at <b>${new Date().toLocaleString()}</b>.</p><p>If this wasn't you, please secure your account immediately.</p>`
        });
    }

    const token = generateToken(user);
    const { password: _, otp: __, otpExpiresAt: ___, ...userData } = user.toObject();
    return { user: userData, token };
};

export const googleAuthenticate = async (token: string, mode: 'register' | 'login') => {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new ApiError('Invalid Google token', 400);
    }

    const { email, name, sub: googleId } = payload;
    if (!email) throw new ApiError('Google account does not have an email', 400);

    // Fetch global settings
    const settings = await SettingsModel.findOne();
    if (!settings) throw new ApiError('Settings not found', 500);

    const { allowRegistration, moderateNewUsers } = settings.userSettings;
    const { appName } = settings.systemSettings;

    let user = await User.findOne({ email });

    // REGISTRATION MODE
    if (mode === 'register') {
        if (!allowRegistration) {
            throw new ApiError('User registration is disabled by admin.', 403);
        }

        if (user) {
            // User already exists
            if (user.isEmailVerified) {
                throw new ApiError('Email already registered. Please use login instead.', 400);
            }

            // Mark as verified (Google verified)
            user.isEmailVerified = true;
            user.googleId = payload.sub;
            user.isActive = !moderateNewUsers;
            await user.save();

            if (!user.isActive) {
                // Notify admins
                await sendNotification({
                    title: "New Google User Joined",
                    message: `${user.username} signed up using Google on ${appName}.`,
                    forAdmin: true,
                    type: "success",
                    category: "user",
                });

                return {
                    message: "Registration successful. Awaiting admin approval before login.",
                    requireEmailVerification: false,
                    isActive: false
                };
            }

            const token = generateToken(user);
            const { password: _, ...userData } = user.toObject();
            // Notify admins
            await sendNotification({
                title: "New Google User Joined",
                message: `${user.username} signed up using Google on ${appName}.`,
                forAdmin: true,
                type: "success",
                category: "user",
            });
            // Notify user
            await sendNotification({
                userId: user.id,
                title: 'Welcome!',
                message: `Welcome to ${appName}, ${user.username}!`,
                type: 'success',
                category: 'user'
            });

            return {
                message: "Registered and logged in successfully.",
                user: userData,
                token,
                requireEmailVerification: false,
                isActive: true
            };
        }

        // Create new user with Google
        const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
        user = await createUser(
            name || email.split('@')[0],
            email,
            randomPassword,
            false, // Email already verified by Google
            moderateNewUsers
        );

        user.isEmailVerified = true;
        user.googleId = payload.sub;
        await user.save();

        if (!user.isActive) {
            // Notify admins
            await sendNotification({
                title: "New Google User Joined",
                message: `${user.username} signed up using Google on ${appName}.`,
                forAdmin: true,
                type: "success",
                category: "user",
            });

            return {
                message: "Registration successful. Awaiting admin approval.",
                requireEmailVerification: false,
                isActive: false
            };
        }

        const userToken = generateToken(user);
        const { password: _, ...userData } = user.toObject();
        // Notify admins
        await sendNotification({
            title: "New Google User Joined",
            message: `${user.username} signed up using Google on ${appName}.`,
            forAdmin: true,
            type: "success",
            category: "user",
        });

        // Notify user
        await sendNotification({
            userId: user.id,
            title: 'Welcome!',
            message: `Welcome to ${appName}, ${user.username}!`,
            type: 'success',
            category: 'user'
        });

        return {
            message: 'Registration successful. Logged in successfully.',
            user: userData,
            token: userToken,
            requireEmailVerification: false,
            isActive: true
        };
    }

    // LOGIN MODE
    if (mode === 'login') {
        if (!user) {
            throw new ApiError('No account found with this email. Please register first.', 404);
        }

        // Check if account is Google-linked
        if (!user.googleId) {
            throw new ApiError('This account was registered with email/password. Please use regular login.', 400);
        }

        if (user.isBlocked) {
            throw new ApiError('Your account has been blocked. Please contact support.', 403);
        }

        if (!user.isEmailVerified) {
            throw new ApiError('Please verify your email before logging in.', 403);
        }

        if (!user.isActive) {
            throw new ApiError('Your account is pending admin approval.', 403);
        }

        user.lastLoginAt = new Date();
        await user.save();

        const userToken = generateToken(user);
        const { password: _, otp: __, otpExpiresAt: ___, ...userData } = user.toObject();
        return { user: userData, token: userToken, isActive: true, requireEmailVerification: false };
    }

    throw new ApiError('Invalid authentication mode', 400);
};

export const verifyEmailOtp = async (email: string, otp: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError('Invalid email or OTP.', 400);
    if (user.isEmailVerified) throw new ApiError('Email is already verified.', 400);

    // Check OTP validity
    if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        throw new ApiError('Invalid or expired OTP.', 400);
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user);
    const { password: _, otp: __, otpExpiresAt: ___, ...userData } = user.toObject();
    if (!user.isActive) return { message: "Email verified successfully. Your account is pending admin approval.", isActive: false };
    return { message: 'Email verified successfully.', user: userData, token, requireEmailVerification: false, isActive: true };
};

export const resendEmailOtp = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError('Invalid email.', 400);

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await sendVerificationOtp(user);

    return { message: 'A new OTP has been sent to your email.', requireEmailVerification: true };
};

export const sendForgotPasswordOtp = async (email: string) => {
    const user = await User.findOne({ email });
    if (user) {
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Your password reset code is: ${otp}. It will expire in 5 minutes.`,
            html: `<p>Your password reset code is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`,
        });
    }

    return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
};

export const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string) => {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        throw new ApiError('Invalid or expired OTP.', 400);
    }

    user.password = await hashPassword(newPassword);
    user.otp = null;
    user.otpExpiresAt = null;
    user.isEmailVerified = true;

    await user.save();

    await sendNotification({
        userId: user.id,
        title: 'Password Changed',
        message: 'Your password was successfully updated.',
        type: 'success',
        category: 'security'
    });

    return { message: 'Password reset successfully. You can now log in.' };
};

export const getOtpRemainingTime = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user || !user.otpExpiresAt) {
        // OTP never sent or expired
        return { remaining: 0 };
    }

    const now = new Date();
    const remaining = Math.max(Math.floor((user.otpExpiresAt.getTime() - now.getTime()) / 1000), 0);

    return { remaining };
};