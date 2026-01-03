import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';
import { AuthRequest } from "../types/auth";
import { emitMaintenanceStatus } from '../services/maintenance.service';
import { startMaintenanceCronJob, stopMaintenanceCronJob } from '../cron-jobs/maintenances';
import { getSocketIO } from '../utils/socket.utils';

/**
 * ============================
 * APPLICATION SETTINGS CONTROLLER
 * ============================
 */

/**
 * Get application settings
 */
export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await settingsService.getSettings();
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};


/**
 * Update application settings
 */
export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settingsData = req.body;

        // Validate required fields
        if (!settingsData || typeof settingsData !== 'object') {
            res.status(400).json({ message: 'Invalid settings data provided' });
            return;
        }

        // Persist updated settings
        const updatedSettings = await settingsService.updateSettings(settingsData)

        const io = getSocketIO();
        // Notify all connected clients about settings update
        io.emit('settingsUpdated', updatedSettings);
        // Emit current maintenance status
        await emitMaintenanceStatus(io);


        const { maintenanceMode, maintenanceStart, maintenanceEnd } = updatedSettings.systemSettings || {};

        // Handle maintenance cron job lifecycle
        if (maintenanceMode && maintenanceStart && maintenanceEnd) {
            const now = new Date();
            const end = new Date(maintenanceEnd);

            // Start cron only if maintenance window is still active
            if (now <= end) startMaintenanceCronJob(io);
        } else {
            // Stop cron if maintenance is disabled
            stopMaintenanceCronJob();
        }

        res.status(200).json(updatedSettings);
    } catch (error) {
        next(error);
    }
};


/**
 * Reset application settings
 */
export const resetSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { section } = req.body as { section?: string };

        let result;
        // Reset a specific section or all settings
        if (section) {
            result = await settingsService.resetSectionToDefault(section);
        } else {
            result = await settingsService.resetToDefaultSettings();
        }

        const io = getSocketIO();
        // Notify clients about settings reset
        io.emit('settingsReset', { section: section || 'all', settings: result });
        // Emit updated maintenance status
        await emitMaintenanceStatus(io);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};