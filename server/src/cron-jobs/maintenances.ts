import cron, { ScheduledTask } from "node-cron";
import SettingsModel from "../models/settings.model";
import { emitMaintenanceStatus, getMaintenanceStatus } from "../services/maintenance.service";

let maintenanceCheckJob: ScheduledTask | null = null;
/**
 * ============================
 * MAINTENANCE CRON JOB
 * ============================
 */

/**
 * Start cron to monitor maintenance window
 */
export const startMaintenanceCronJob = (io: any): void => {
    // Prevent multiple cron instances
    if (maintenanceCheckJob) return;

    maintenanceCheckJob = cron.schedule("* * * * *", async () => {
        try {
            const settings = await SettingsModel.findOne();
            if (!settings?.systemSettings) return;

            const { maintenanceMode, maintenanceStart, maintenanceEnd } = settings.systemSettings;
            // Exit if maintenance configuration is incomplete
            if (!maintenanceMode || !maintenanceStart || !maintenanceEnd) return;

            const now = new Date();
            const start = new Date(maintenanceStart);
            const end = new Date(maintenanceEnd);

            // Determine expected maintenance state
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
                // Notify all connected clients
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
