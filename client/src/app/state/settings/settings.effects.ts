import { Injectable, inject } from "@angular/core";
import { AdminApiService } from "../../core/services/api/admin/admin-api.service";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";
import { AdminSettings } from "../../models/settings/adminSettings.interface";
import { AdminSettingsStore } from "./settings.store";
import { SETTINGS_SECTIONS } from "../../shared/utils/settings-sections";

@Injectable({ providedIn: 'root' })
export class AdminSettingsEffects {
    private api = inject(AdminApiService);
    private store = inject(AdminSettingsStore);
    private snackbar = inject(SnackbarService);

    async loadSettings() {
        this.store.setLoading();
        try {
            const settings = await firstValueFrom(this.api.getSettings());
            this.store.setSettings(settings);
            return settings;
        } catch (error: any) {
            this.handleError(error, 'Failed to load settings.');
            return null;
        }
    }

    async saveSettings(settings: Partial<AdminSettings>, section?: string) {
        this.store.setLoading();
        try {
            const updated = await firstValueFrom(this.api.updateSettings(settings));
            this.store.updateSettings(updated);

            const message = section
                ? `${SETTINGS_SECTIONS[section] || section} saved successfully.`
                : 'All settings saved successfully.';

            this.snackbar.showSuccess(message);

        } catch (error: any) {
            this.handleError(error, 'Failed to save settings.');
        }
    }

    async resetSettings(section?: string): Promise<AdminSettings> {
        this.store.setLoading();
        try {
            const reset = await firstValueFrom(this.api.resetSettings(section));
            this.store.resetSettings(reset);

            const message = section
                ? `${SETTINGS_SECTIONS[section] || section} reset successfully.`
                : 'All settings reset successfully.';

            this.snackbar.showSuccess(message);
            return reset;

        } catch (error: any) {
            this.handleError(error, 'Failed to reset settings.');
            throw error;
        }
    }


    private handleError(error: any, fallback: string) {
        const message = error?.error?.message || fallback;
        this.store.setError(message);
        this.snackbar.showError(message);
    }
}