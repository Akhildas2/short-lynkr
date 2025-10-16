import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { AdminSettings } from "../../models/settings/adminSettings.interface";
import { initialState } from "../../models/settings/adminSettings-state.model";

export const AdminSettingsStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        // Loading & Error
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(error: string) {
            patchState(store, { status: 'error', error });
        },
        setSuccess() {
            patchState(store, { status: 'success', error: null });
        },

        // Settings Management
        setSettings(settings: AdminSettings) {
            patchState(store, { settings, status: 'success', error: null });
        },
        updateSettings(settings: Partial<AdminSettings>) {
            const current = store.settings() || {} as AdminSettings;
            const updated = { ...current, ...settings };
            patchState(store, { settings: updated, status: 'success', error: null });
        },
        resetSettings(settings: AdminSettings) {
            patchState(store, { settings, status: 'success', error: null });
        },
        clearSettings() {
            patchState(store, initialState);
        }
    }))
);