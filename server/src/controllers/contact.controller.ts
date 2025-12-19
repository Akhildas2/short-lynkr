import { Request, Response, NextFunction } from 'express';
import ContactModel from '../models/contact.model';
import { detectDevice } from '../utils/deviceDetector';
import { generateInquiryId } from '../utils/inquiryId';
import { detectPlatform } from '../utils/platformDetector';

/**
 * Send contact message
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, phoneNumber, email, subject, message } = req.body;

        if (!name || !phoneNumber || !email || !message) {
            res.status(400).json({ message: 'Required fields are missing' });
            return;
        }

        const clientIp =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'Unknown';

        const userAgent = req.get('User-Agent') || 'Unknown';
        const device = detectDevice(userAgent);
        const platform = detectPlatform(userAgent);

        const newMessage = await ContactModel.create({
            inquiryId: generateInquiryId(),
            name,
            phoneNumber,
            email,
            subject,
            message,
            ipAddress: clientIp,
            userAgent,
            device,
            platform
        });

        res.status(201).json(newMessage);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all messages (Admin)
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messages = await ContactModel.find()
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

/**
 * Mark message as read
 */
export const readMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const message = await ContactModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

/**
 * Change message status
 */
export const changeMessageStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const message = await ContactModel.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete message
 */
export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const message = await ContactModel.findByIdAndDelete(id);

        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        next(error);
    }
};