import { SocialQrEntry } from "./socialQr.interface";

export interface SocialQrState {
    socialQrs: SocialQrEntry[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    selectedQr: SocialQrEntry | null;
}

export const initialState: SocialQrState = {
    socialQrs: [],
    status: 'idle',
    error: null,
    selectedQr: null,
};