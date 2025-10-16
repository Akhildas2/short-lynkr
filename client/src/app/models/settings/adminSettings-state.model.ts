import { AdminSettings } from "./adminSettings.interface";

export interface AdminSettingsState {
    settings: AdminSettings | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

export const initialState: AdminSettingsState = {
    settings: null,
    status: 'idle',
    error: null
};