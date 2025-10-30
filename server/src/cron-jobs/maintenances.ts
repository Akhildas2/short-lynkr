import cron, { ScheduledTask } from "node-cron";
import SettingsModel from "../models/settings.model";
import { emitMaintenanceStatus, getMaintenanceStatus } from "../services/maintenance.service";

let maintenanceCheckJob: ScheduledTask | null = null;

/**
 * Start cron to monitor maintenance window
 */
export const startMaintenanceCronJob = (io: any): void => {
    if (maintenanceCheckJob) return; // already running

    maintenanceCheckJob = cron.schedule("* * * * *", async () => {
        try {
            const settings = await SettingsModel.findOne();
            if (!settings?.systemSettings) return;

            const { maintenanceMode, maintenanceStart, maintenanceEnd } = settings.systemSettings;
            if (!maintenanceMode || !maintenanceStart || !maintenanceEnd) return;

            const now = new Date();
            const start = new Date(maintenanceStart);
            const end = new Date(maintenanceEnd);

            const shouldBeActive = now >= start && now <= end;
            const currentStatus = await getMaintenanceStatus();

            // Update status if changed
            if (shouldBeActive !== currentStatus) {
                if (!shouldBeActive && currentStatus) {
                    // Maintenance ended → disable
                    await SettingsModel.findOneAndUpdate({}, {
                        $set: {
                            'systemSettings.maintenanceMode': false,
                            'systemSettings.maintenanceStart': null,
                            'systemSettings.maintenanceEnd': null
                        }
                    });
                }
                await emitMaintenanceStatus(io);
            }

            // Stop cron if past end
            if (now > end) stopMaintenanceCronJob();

        } catch (err) {
            console.error("Error in maintenance cron job:", err);
        }
    });
};

/**
 * Stop the cron job
 */
export const stopMaintenanceCronJob = (): void => {
    if (maintenanceCheckJob) {
        maintenanceCheckJob.stop();
        maintenanceCheckJob = null;
    }
};
