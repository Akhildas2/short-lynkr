import { inject, Injectable } from '@angular/core';
import { SocialQrStore } from './social-qr.store';
import { SnackbarService } from '../../shared/services/snackbar/snackbar.service';
import { firstValueFrom } from 'rxjs';
import { SocialQrService } from '../../core/services/api/social-qr/social-qr.service';
import { SocialQrEntry } from '../../models/qr/socialQr.interface';

@Injectable({ providedIn: 'root' })
export class SocialQrEffects {
    private store = inject(SocialQrStore);
    private api = inject(SocialQrService);
    private snackbar = inject(SnackbarService);

    async createSocialQr(data: {
        platform: string;
        accountUrl: string;
        size?: number;
        format?: 'PNG' | 'JPEG' | 'SVG';
        foregroundColor?: string;
        backgroundColor?: string;
    }): Promise<SocialQrEntry | null> {
        this.store.setLoading();
        try {
            const qr = await firstValueFrom(this.api.createSocialQr(data));
            this.store.addSocialQr(qr);
            this.snackbar.showSuccess('Social QR created successfully.');
            return qr;
        } catch (err: any) {
            const message = err?.error?.message || 'Failed to create QR.';
            this.store.setError(message);
            this.snackbar.showError(message);
            return null;
        }
    }


    async updateSocialQr(id: string, data: Partial<SocialQrEntry>): Promise<void> {
        this.store.setLoading();
        try {
            const qr = await firstValueFrom(this.api.updateSocialQr(id, data));
            this.store.updateSocialQr(qr);
            this.snackbar.showSuccess('Social QR updated successfully.');
        } catch (err: any) {
            const message = err?.error?.message || 'Failed to update QR.';
            this.store.setError(message);
            this.snackbar.showError(message);
        }
    }


    async fetchSocialQrs(): Promise<void> {
        this.store.setLoading();
        try {
            const qrs = await firstValueFrom(this.api.getSocialQr());
            this.store.setSocialQrs(qrs);
        } catch (err: any) {
            const message = err?.error?.message || 'Failed to load QR codes.';
            this.store.setError(message);
            this.snackbar.showError(message);
        }
    }


    async fetchSocialQrById(id: string): Promise<void> {
        this.store.setLoading();
        try {
            const qr = await firstValueFrom(this.api.getSocialQrById(id));
            this.store.setSelectedQr(qr);
        } catch (err: any) {
            const message = err?.error?.message || 'Failed to fetch QR.';
            this.store.setError(message);
            this.snackbar.showError(message);
        }
    }


    async deleteSocialQr(id: string): Promise<void> {
        this.store.setLoading();
        try {
            await firstValueFrom(this.api.deleteSocialQr(id));
            this.store.removeSocialQr(id);
            this.snackbar.showSuccess('Social QR deleted successfully.');
        } catch (err: any) {
            const message = err?.error?.message || 'Failed to delete QR.';
            this.store.setError(message);
            this.snackbar.showError(message);
        }
    }

}