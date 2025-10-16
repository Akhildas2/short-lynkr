import Settings from '../models/settings.model';
import { ISettings } from "../types/settings.interface";
import { ApiError } from '../utils/ApiError';
import { validateSettingsData } from '../utils/validateSettingsData';

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

    for (const section of sections) {
        if ((settingsData as any)[section]) {
            (settings as any)[section] = { ...(settings as any)[section], ...(settingsData as any)[section] };
        }
    }

    await settings.save()
    return settings;
}

export const resetToDefaultSettings = async (): Promise<ISettings> => {

    await Settings.deleteMany({});
    return await Settings.create({});

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
    return settings;

};