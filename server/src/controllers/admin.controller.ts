import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/admin.service'

// ===== USERS =====
export const lsitUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const users = await AdminService.getAllUsers()
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
}

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const updateUser = await AdminService.updateUser(req.params.id, req.body);
        res.json(updateUser);

    } catch (error) {
        next(error);
    }
}

export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const result = await AdminService.toggleBlockUser(req.params.id);
        res.json(result);

    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        await AdminService.deleteUser(req.params.id);
        res.json({ success: true });

    } catch (error) {
        next(error);
    }
}

// ===== URLS =====
export const listUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const urls = await AdminService.getAllUrls();
        res.json(urls);
    } catch (err) {
        next(err);
    }
};

export const blockUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.toggleBlockUrl(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const deleteUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AdminService.deleteUrl(req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};