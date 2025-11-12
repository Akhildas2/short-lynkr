import Notification from '../models/notification.model';
import { INotification } from '../types/notification.interface';

/**
 * Sends a notification to a user or admin.
 */
export const sendNotification = async (options: Partial<INotification>) => {
    const {
        userId = null,
        title,
        message,
        type = 'info',
        category = 'system',
        forAdmin = false
    } = options;

    if (!title || !message) {
        throw new Error('Notification title and message are required.');
    }

    const notification: Partial<INotification> = {
        userId,
        title,
        message,
        type,
        category,
        forAdmin,
        read: false, // default to unread
    };

    await Notification.create(notification);
};