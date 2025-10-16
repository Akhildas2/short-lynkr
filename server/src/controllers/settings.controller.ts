import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';
import { AuthRequest } from "../types/auth";


export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await settingsService.getSettings();
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};


export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settingsData = req.body;

        // Validate required fields
        if (!settingsData || typeof settingsData !== 'object') {
            res.status(400).json({ message: 'Invalid settings data provided' });
            return;
        }

        const updatedSettings = await settingsService.updateSettings(settingsData)

        const io = req['io'];
        io?.emit('settingsUpdated', updatedSettings);

        res.status(200).json(updatedSettings);
    } catch (error) {
        next(error);
    }
};


export const resetSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { section } = req.body as { section?: string };
        
        let result;
        if (section) {
            result = await settingsService.resetSectionToDefault(section);
        } else {
            result = await settingsService.resetToDefaultSettings();
        }

        const io = req['io'];
        io?.emit('settingsReset', { section: section || 'all', settings: result });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};