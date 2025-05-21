import { UrlEntry } from "./url.model";

export interface UrlState {
    urls: UrlEntry[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    selectedUrl: UrlEntry | null;
}

export const initialState: UrlState = {
    urls: [],
    status: 'idle',
    error: null,
    selectedUrl: null,
};