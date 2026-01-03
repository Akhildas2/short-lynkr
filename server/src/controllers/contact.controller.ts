import { Request, Response, NextFunction } from 'express';
import ContactModel from '../models/contact.model';
import { detectDevice } from '../utils/deviceDetector';
import { generateInquiryId } from '../utils/inquiryId';
import { detectPlatform } from '../utils/platformDetector';

/**
 * ============================
 * CONTACT CONTROLLER
 * ============================
 */

/**
 * Send a contact / inquiry message
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, phoneNumber, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !phoneNumber || !email || !message) {
            res.status(400).json({ message: 'Required fields are missing' });
            return;
        }

        // Extract client IP address safely
        const clientIp =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'Unknown';

        // Extract user agent information
        const userAgent = req.get('User-Agent') || 'Unknown';
        const device = detectDevice(userAgent);
        const platform = detectPlatform(userAgent);

        // Save message to database
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
 * Get all contact messages (Admin)
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messages = await ContactModel.find().sort({ createdAt: -1 }).lean();// improves read performance
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};


/**
 * Mark a message as read
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
 * Update message status (e.g., pending, resolved)
 */
export const changeMessageStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status) {
            res.status(400).json({ message: 'Status is required', });
            return;
        }

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
 * Delete a contact message
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