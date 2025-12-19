import Settings from '../models/settings.model';
import { ISettings } from "../types/settings.interface";
import { ApiError } from '../utils/ApiError';
import { validateSettingsData } from '../utils/validateSettingsData';
import { sendNotification } from './sendNotifications.service';

export const getSettings = async (): Promise<ISettings> => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }

    return settings;
}


export const updateSettings = async (settingsData: Partial<ISettings>): Promise<ISettings> => {
    await validateSettingsData(settingsData);

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const sections = [
        'urlSettings', 'qrSettings', 'analyticsSettings',
        'userSettings', 'systemSettings', 'notificationSettings', 'securitySettings'
    ];

    const updatedSections: string[] = [];
    for (const section of sections) {
        if ((settingsData as any)[section]) {
            (settings as any)[section] = { ...(settings as any)[section], ...(settingsData as any)[section] };
            updatedSections.push(section);
        }
    }

    await settings.save()
    if (updatedSections.length > 0) {
        // Notify admins
        await sendNotification({
            title: "Settings Updated",
            message: `System configuration updated successfully. Modified sections: ${updatedSections.join(', ')}.`,
            forAdmin: true,
            type: "info",
            category: "settings",
        });
    }

    return settings;
}


export const resetToDefaultSettings = async (): Promise<ISettings> => {
    await Settings.deleteMany({});
    const newSettings = await Settings.create({});

    //  Notify admins
    await sendNotification({
        title: "System Settings Reset",
        message: "All system settings have been reset to their default values. Please review and reconfigure if needed.",
        forAdmin: true,
        type: "warning",
        category: "settings",
    });

    return newSettings;

};


export const resetSectionToDefault = async (section: string): Promise<ISettings> => {

    const allowedSections = [
        'urlSettings',
        'qrSettings',
        'analyticsSettings',
        'userSettings',
        'systemSettings',
        'notificationSettings',
        'securitySettings'
    ];

    if (!allowedSections.includes(section)) {
        throw new ApiError(`Invalid settings section: ${section}`, 400);
    }

    // find existing settings
    let settings = await Settings.findOne();
    if (!settings) return await Settings.create({});

    const defaultDoc = new Settings();
    (settings as any)[section] = (defaultDoc as any)[section];

    await settings.save();
    //  Notify admins
    await sendNotification({
        title: "Settings Section Reset",
        message: `The "${section}" section has been reset to its default configuration.`,
        forAdmin: true,
        type: "warning",
        category: "settings",
    });

    return settings;

};