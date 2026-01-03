import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { AuthRequest } from "../types/auth";
import { Types } from "mongoose";
import { getSocketIO } from "../utils/socket.utils";

/**
 * ============================
 * NOTIFICATION CONTROLLER
 * ============================
 */

/**
 * Get notifications (User & Admin)
 */
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === "admin";

        let filter: any = {};

        // Admin sees admin + global notifications
        if (isAdmin) {
            filter = {
                $or: [{ forAdmin: true }, { userId: null, forAdmin: false }]
            };
        } else {  // User sees personal + global notifications
            filter = { $or: [{ userId }, { userId: null, forAdmin: false }] };
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();

        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};


/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        // Notify clients via Socket.IO
        const io = getSocketIO();
        io.emit("notificationUpdated", notification);

        res.status(200).json(notification);
    } catch (error) {
        next(error);
    }
};


/**
 * Mark multiple notifications as read / unread
 */
export const toggleNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { ids, read } = req.body; // Array of IDs + boolean

        // Validate request body
        if (!ids || !Array.isArray(ids) || !ids.length) {
            res.status(400).json({ message: 'No notification IDs provided' });
            return;
        }

        // Convert string IDs to Mongo ObjectIds
        const objectIds = ids.map((id: string) => new Types.ObjectId(id));

        const result = await Notification.updateMany(
            { _id: { $in: objectIds } },
            { $set: { read: !!read } }
        );

        const io = getSocketIO();
        io.emit("notificationUpdated", result);

        res.status(200).json({ message: `Notifications marked as ${read ? 'read' : 'unread'}` });

    } catch (error) {
        next(error);
    }
};


/**
 * Create a new notification
 */
export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, title, message, type, category, forAdmin } = req.body;

        // Create notification
        const notification = await Notification.create({
            userId: userId || null,
            title,
            message,
            type,
            category,
            forAdmin: forAdmin || false,
        });

        // Emit socket event
        const io = getSocketIO();
        io.emit("newNotification", notification);

        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a single notification
 */
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        const io = getSocketIO();
        io.emit("notificationDeleted", notification);

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        next(error);
    }
};


/**
 * Delete multiple notifications
 */
export const deleteMultipleNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { ids } = req.body;

        // Validate request body
        if (!ids || !Array.isArray(ids) || !ids.length) {
            res.status(400).json({ message: 'No notification IDs provided' });
            return;
        }

        // Delete all notifications with the given IDs
        const result = await Notification.deleteMany({ _id: { $in: ids } });

        const io = getSocketIO();
        io?.emit("notificationDeleted", result);

        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        next(error);
    }
};