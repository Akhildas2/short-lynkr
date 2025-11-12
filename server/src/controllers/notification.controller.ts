import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { AuthRequest } from "../types/auth";
import { Types } from "mongoose";


// Get notifications (User & Admin)
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === "admin";

        let filter: any = {};
        if (isAdmin) {
            filter = { forAdmin: true };
        } else {
            filter = { $or: [{ userId }, { forAdmin: false, userId: null }] };
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};


// Mark as read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification) res.status(404).json({ message: "Notification not found" });

        const io = req["io"];
        io?.emit("notificationUpdated", notification);

        res.status(200).json(notification);
    } catch (error) {
        next(error);
    }
};


export const toggleNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { ids, read } = req.body; // Array of IDs + boolean

        if (!ids || !Array.isArray(ids) || !ids.length) {
            res.status(400).json({ message: 'No notification IDs provided' });
            return;
        }

        // Convert string IDs to ObjectId
        const objectIds = ids.map(id => new Types.ObjectId(id));

        const result = await Notification.updateMany(
            { _id: { $in: objectIds } },
            { $set: { read: !!read } }
        );

        const io = req["io"];
        io?.emit("notificationUpdated", result);

        res.status(200).json({ message: `Notifications marked as ${read ? 'read' : 'unread'}` });

    } catch (error) {
        next(error);
    }
};


// Create new notification
export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, title, message, type, category, forAdmin } = req.body;

        const notification = await Notification.create({
            userId: userId || null,
            title,
            message,
            type,
            category,
            forAdmin: forAdmin || false,
        });

        const io = req["io"];
        io?.emit("newNotification", notification);

        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
};


// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        const io = req["io"];
        io?.emit("notificationDeleted", id);

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        next(error);
    }
};