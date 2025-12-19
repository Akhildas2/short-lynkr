import { Request, Response, NextFunction } from 'express';
import UrlModel from '../models/url.model';
import { generateQRCode } from '../utils/qrCodeGenerator';
import SettingsModel from '../models/settings.model';
import SocialQrModel from "../models/socialQr.model";
import { AuthRequest } from '../types/auth';


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
        const { platform, accountUrl, size = 300, format = "PNG", foregroundColor = "#000000", backgroundColor = "#FFFFFF" } = req.body;
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

        const qr = await SocialQrModel.findById(id);
        if (!qr) {
            res.status(404).json({ message: "QR not found" });
            return;
        }

        if (role !== 'admin' && qr.userId?.toString() !== userId) {
            res.status(403).json({ message: "You cannot delete this QR." });
            return;
        }

        await SocialQrModel.findByIdAndDelete(id);

        res.json({ message: "QR deleted successfully" });
    } catch (err) {
        next(err);
    }
};