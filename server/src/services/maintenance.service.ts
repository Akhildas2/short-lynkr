import SettingsModel from "../models/settings.model";

let lastMaintenanceMode: boolean | null = null;

/**
 * Get current maintenance status
 */
export const getMaintenanceStatus = async (): Promise<boolean> => {
    const settings = await SettingsModel.findOne();
    if (!settings?.systemSettings) return false;

    const { maintenanceMode, maintenanceStart, maintenanceEnd } = settings.systemSettings;

    // Manual maintenance off
    if (!maintenanceMode) return false;

    const now = new Date();
    const start = maintenanceStart ? new Date(maintenanceStart) : null;
    const end = maintenanceEnd ? new Date(maintenanceEnd) : null;

    // No time window → rely on manual flag
    if (!start || !end) return maintenanceMode;

    // Current time within window → active
    if (now >= start && now <= end) return true;

    // Past end → auto-disable maintenance
    if (now > end) {
        await SettingsModel.findOneAndUpdate({}, {
            $set: {
                'systemSettings.maintenanceMode': false,
                'systemSettings.maintenanceStart': null,
                'systemSettings.maintenanceEnd': null
            }
        });
        return false;
    }

    return false;
};

/**
 * Emit maintenance status via Socket.IO
 */
export const emitMaintenanceStatus = async (io: any) => {
    const status = await getMaintenanceStatus();
    if (status !== lastMaintenanceMode) {
        io.emit("maintenanceMode", status);
        lastMaintenanceMode = status;
    }
};

/**
 * Broadcast maintenance status every 30 seconds
 */
export const startMaintenanceStatusBroadcast = (io: any) => {
    emitMaintenanceStatus(io); // emit immediately
    setInterval(async () => {
        await emitMaintenanceStatus(io);
    }, 30_000);
};