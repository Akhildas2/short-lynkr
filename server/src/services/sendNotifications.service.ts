import Notification from '../models/notification.model';
import { INotification } from '../types/notification.interface';
import { getSocketIO } from '../utils/socket.utils';

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

    const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        category,
        forAdmin,
        read: false
    });

    const io = getSocketIO();
    if (forAdmin) {
        io.to('admins').emit('newNotification', notification);
    } else if (userId) {
        io.to(`user:${userId}`).emit('newNotification', notification);
    } else {
        io.emit('newNotification', notification); // system broadcast
    }

    return notification;
};