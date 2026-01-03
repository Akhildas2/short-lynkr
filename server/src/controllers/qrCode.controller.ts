import { Request, Response, NextFunction } from 'express';
import UrlModel from '../models/url.model';
import { generateQRCode } from '../utils/qrCodeGenerator';
import SettingsModel from '../models/settings.model';
import SocialQrModel from "../models/socialQr.model";
import { AuthRequest } from '../types/auth';
import { sendNotification } from '../services/sendNotifications.service';

/**
 * ============================
 * QR CODE CONTROLLER
 * ============================
 */

/**
 * Generate QR code for a shortened URL
 */
export const getQrCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { id } = req.params;
        const format = (req.query.format as 'PNG' | 'JPEG' | 'SVG') || 'PNG';
        const size = Number(req.query.size) || 300;

        const url = await UrlModel.findById(id);
        if (!url) {
            res.status(404).json({ message: 'URL not found' });
            return;
        }

        const settings = await SettingsModel.findOne();
        const qrSettings = settings?.qrSettings;

        // Generate QR Code
        const qrCodeData = await generateQRCode(url.shortUrl, {
            size,
            format,
            foregroundColor: qrSettings?.foregroundColor,
            backgroundColor: qrSettings?.backgroundColor
        });

        // Handle SVG response
        if (format === 'SVG') {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(Buffer.from(qrCodeData.split(',')[1], 'base64').toString('utf-8'));
            return;
        }

        // Handle PNG / JPEG response
        const mimeType = format === 'JPEG' ? 'image/jpeg' : 'image/png';
        const base64Data = qrCodeData.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', mimeType);
        res.send(imgBuffer);
    } catch (err) {
        next(err);
    }
};


/**
 * ============================
 * SOCIAL QR CONTROLLER
 * ============================
 */

/**
 * Create a social media QR code
 */
export const createSocialQr = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { platform, accountUrl, size = 300, format = "PNG", foregroundColor = "#000000", backgroundColor = "#FFFFFF" } = req.body;

        // Validate request body
        if (!platform || !accountUrl) {
            res.status(400).json({ message: 'Platform and account URL are required' });
            return;
        }

        // Prevent duplicate QR
        const existingQr = await SocialQrModel.findOne({
            userId,
            platform,
            accountUrl,
        });

        if (existingQr) {
            res.status(409).json({ message: 'You already have a QR code for this account URL.' });
            return
        }

        const qrCodeData = await generateQRCode(accountUrl, { size, format, foregroundColor, backgroundColor });

        const qr = await SocialQrModel.create({
            platform,
            accountUrl,
            qrCodeUrl: qrCodeData,
            size,
            format,
            foregroundColor,
            backgroundColor,
            userId
        });

        // Notify admin
        await sendNotification({
            title: 'New Social QR Created',
            message: `${req.user?.email} created a new ${platform} QR code (${accountUrl}).`,
            forAdmin: true,
            type: 'info',
            category: 'qr'
        });

        // Notify user
        await sendNotification({
            userId: qr.userId,
            title: 'QR Code Created',
            message: `Hi ${req.user?.email}, your ${platform} QR code (${accountUrl}) has been created successfully.`,
            type: 'success',
            category: 'qr'
        });

        res.status(201).json(qr);
    } catch (err) {
        next(err);
    }
};


/**
 * Get all social QR codes (Admin / User)
 */
export const getAllSocialQr = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        if (!userId) {
            res.status(401).json({ message: 'Invalid or expired authentication token.' });
            return;
        }

        const filter = role === 'admin' ? {} : { userId };
        const list = await SocialQrModel.find(filter).populate('userId', 'username email').sort({ createdAt: -1 });

        res.status(200).json(list);
    } catch (err) {
        next(err);
    }
};


/**
 * Get a social QR by ID
 */
export const getSocialQrById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const role = req.user?.role;

        const qr = await SocialQrModel.findById(id);
        if (!qr) {
            res.status(404).json({ message: "QR not found" });
            return;
        }

        // Access control
        if (role !== 'admin' && qr.userId?.toString() !== userId) {
            res.status(403).json({ message: "You are not allowed to access this QR." });
            return;
        }

        res.status(200).json(qr);
    } catch (err) {
        next(err);
    }
};


/**
 * Update a social QR code
 */
export const updateSocialQr = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const role = req.user?.role;

        const qr = await SocialQrModel.findById(id);
        if (!qr) {
            res.status(404).json({ message: "QR not found" });
            return;
        }

        // Access control
        if (role !== 'admin' && qr.userId?.toString() !== userId) {
            res.status(403).json({ message: "You cannot update this QR." });
            return;
        }

        const { platform, accountUrl, size, format, foregroundColor, backgroundColor } = req.body;

        const qrCodeData = await generateQRCode(accountUrl || qr.accountUrl, {
            size: size || qr.size,
            format: format || qr.format,
            foregroundColor: foregroundColor || qr.foregroundColor,
            backgroundColor: backgroundColor || qr.backgroundColor
        });

        const updatedQr = await SocialQrModel.findByIdAndUpdate(id, {
            platform: platform ?? qr.platform,
            accountUrl: accountUrl ?? qr.accountUrl,
            size: size ?? qr.size,
            format: format ?? qr.format,
            foregroundColor: foregroundColor ?? qr.foregroundColor,
            backgroundColor: backgroundColor ?? qr.backgroundColor,
            qrCodeUrl: qrCodeData
        }, { new: true });

        // Notifications
        if (role === 'admin') {
            await sendNotification({
                userId: qr.userId,
                title: 'QR Code Updated',
                message: `Your ${qr.platform} QR code was updated by admin ${req.user?.email}.`,
                type: 'info',
                category: 'qr'
            });
        } else {
            await sendNotification({
                title: 'Social QR Updated',
                message: `User ${req.user?.email} updated their ${qr.platform} QR code.`,
                forAdmin: true,
                type: 'info',
                category: 'qr'
            });
        }

        res.status(200).json(updatedQr);
    } catch (err) {
        next(err);
    }
};


/**
 * Delete a social QR code
 */
export const deleteSocialQr = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const role = req.user?.role;

        const qr = await SocialQrModel.findById(id).populate('userId', 'email');
        if (!qr) {
            res.status(404).json({ message: "QR not found" });
            return;
        }

        // Access control
        if (role !== 'admin' && qr.userId?.toString() !== userId) {
            res.status(403).json({ message: "You cannot delete this QR." });
            return;
        }

        await SocialQrModel.findByIdAndDelete(id);

        // Notifications
        if (role === 'admin') {
            await sendNotification({
                userId: qr.userId,
                title: 'QR Code Deleted',
                message: `Your ${qr.platform} QR code was deleted by admin ${req.user?.email}.`,
                type: 'warning',
                category: 'qr'
            });
        } else {
            await sendNotification({
                title: 'Social QR Deleted',
                message: `User ${req.user?.email} deleted their ${qr.platform} QR code.`,
                forAdmin: true,
                type: 'warning',
                category: 'qr'
            });
        }

        res.status(200).json({ message: 'QR deleted successfully' });
    } catch (err) {
        next(err);
    }
};