import { Request, Response, NextFunction } from 'express';
import UrlModel from '../models/url.model';
import { generateQRCode } from '../utils/qrCodeGenerator';
import SettingsModel from '../models/settings.model';
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