import { Request, Response, NextFunction } from 'express';
import UrlModel from '../models/url.model';
import { generateQRCode } from '../utils/qrCodeGenerator';
import SettingsModel from '../models/settings.model';
import SocialQrModel from "../models/socialQr.model";
import { AuthRequest } from '../types/auth';
import { sendNotification } from '../services/sendNotifications.service';


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

        const qrCodeData = await generateQRCode(url.shortUrl, {
            size,
            format,
            foregroundColor: qrSettings?.foregroundColor,
            backgroundColor: qrSettings?.backgroundColor
        });

        if (format === 'SVG') {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(Buffer.from(qrCodeData.split(',')[1], 'base64').toString('utf-8'));
        } else {
            const mimeType = format === 'JPEG' ? 'image/jpeg' : 'image/png';
            const base64Data = qrCodeData.split(',')[1];
            const imgBuffer = Buffer.from(base64Data, 'base64');
            res.setHeader('Content-Type', mimeType);
            res.send(imgBuffer);
        }

    } catch (err) {
        next(err);
    }
};


export const createSocialQr = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { platform, accountUrl, size = 300, format = "PNG", foregroundColor = "#000000", backgroundColor = "#FFFFFF" } = req.body;
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

        await sendNotification({
            title: 'New Social QR Created',
            message: `${req.user?.email} created a new ${platform} QR code (${accountUrl}).`,
            forAdmin: true,
            type: 'info',
            category: 'qr'
        });

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

        res.json(list);
    } catch (err) {
        next(err);
    }
};


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

        res.json(qr);
    } catch (err) {
        next(err);
    }
};


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

        const updated = await SocialQrModel.findByIdAndUpdate(id, {
            platform: platform ?? qr.platform,
            accountUrl: accountUrl ?? qr.accountUrl,
            size: size ?? qr.size,
            format: format ?? qr.format,
            foregroundColor: foregroundColor ?? qr.foregroundColor,
            backgroundColor: backgroundColor ?? qr.backgroundColor,
            qrCodeUrl: qrCodeData
        }, { new: true });

        if (role === 'admin') {
            // Admin updates
            await sendNotification({
                userId: qr.userId,
                title: 'QR Code Updated',
                message: `Your ${qr.platform} QR code was updated by admin ${req.user?.email}.`,
                type: 'info',
                category: 'qr'
            });
        } else {
            // User updates
            await sendNotification({
                title: 'Social QR Updated',
                message: `User ${req.user?.email} updated their ${qr.platform} QR code.`,
                forAdmin: true,
                type: 'info',
                category: 'qr'
            });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};


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

        if (role !== 'admin' && qr.userId?.toString() !== userId) {
            res.status(403).json({ message: "You cannot delete this QR." });
            return;
        }

        await SocialQrModel.findByIdAndDelete(id);

        if (role === 'admin') {
            // Admin deletes
            await sendNotification({
                userId: qr.userId,
                title: 'QR Code Deleted',
                message: `Your ${qr.platform} QR code was deleted by admin ${req.user?.email}.`,
                type: 'warning',
                category: 'qr'
            });
        } else {
            // User deletes
            await sendNotification({
                title: 'Social QR Deleted',
                message: `User ${req.user?.email} deleted their ${qr.platform} QR code.`,
                forAdmin: true,
                type: 'warning',
                category: 'qr'
            });
        }

        res.json({ message: "QR deleted successfully" });
    } catch (err) {
        next(err);
    }
};