import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/admin.service';

// ===== USERS =====
export const listUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await AdminService.getAllUsers();
        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};

export const addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await AdminService.createUser(req.body);
        res.status(201).json(user);

    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedUser = await AdminService.updateUser(req.params.id, req.body);
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(updatedUser);
        }

    } catch (error) {
        next(error);
    }
};

export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { isBlocked } = req.body;
        if (typeof isBlocked !== 'boolean') {
            res.status(400).json({ message: 'Invalid "isBlocked" value' });
        }
        const result = await AdminService.toggleBlockUser(req.params.id, isBlocked);
        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deleted = await AdminService.deleteUser(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json({ success: true });
        }

    } catch (error) {
        next(error);
    }
};

// ===== URLS =====
export const listUrls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const urls = await AdminService.getAllUrls();
        res.status(200).json(urls);

    } catch (error) {
        next(error);
    }
};

export const blockUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { isBlocked } = req.body;
        const result = await AdminService.toggleBlockUrl(req.params.id, isBlocked);
        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

export const deleteUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deleted = await AdminService.deleteUrl(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'URL not found' });
        } else {
            res.json({ success: true });
        }

    } catch (error) {
        next(error);
    };
};

// ===== Analytics  =====
export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const range = (req.query.range as string);
        const urls = await AdminService.getAdminAnalytics(range)
        res.status(200).json(urls);

    } catch (error) {
        next(error);
    }
};

// ===== Dashboard Analytics =====
export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const range = (req.query.range as string);
        const dashboard = await AdminService.getAdminDashboard(range);
        res.status(200).json(dashboard);
    } catch (error) {
        next(error);
    }
};