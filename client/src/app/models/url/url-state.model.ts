import { QrCodeOptions, UrlEntry, UrlStatsResponse } from "./url.model";

export interface UrlState {
    urls: UrlEntry[];
    selectedUrl: UrlEntry | null;
    urlStats: UrlStatsResponse | null;
    generatedQrCode: string | null;
    qrCodeOptions: QrCodeOptions;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    selectedUrlCode: string | null;
}

export  const initialState: UrlState = {
    urls: [],
    selectedUrl: null,
    urlStats: null,
    generatedQrCode: null,
    qrCodeOptions: {
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000',
        cornerColor: '#000000',
        size: 300
    },
    status: 'idle',
    error: null,
    selectedUrlCode: null
};