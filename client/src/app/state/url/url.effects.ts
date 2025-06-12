import { inject, Injectable } from "@angular/core";
import { UrlStore } from "./url.store";
import { UrlService } from "../../core/services/api/url/url.service";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";
import { UrlEntry } from "../../models/url/url.model";



@Injectable({ providedIn: 'root' })

export class UrlEffects {
    private store = inject(UrlStore);
    private api = inject(UrlService);
    private snackbar = inject(SnackbarService);

    async createUrl(originalUrl: string): Promise<UrlEntry | null> {
        this.store.setLoading();
        try {
            const url = await firstValueFrom(this.api.createUrl(originalUrl));
            this.store.addUrl(url);

            this.snackbar.showSuccess('Short URL created successfully.');
            return url;
        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to create URL.';
            this.store.setError(errorMessage);
            this.snackbar.showError(errorMessage);
            return null;
        }
    }

    async updateUrl(id: string, expiryDays: number, customCode: string, clickLimit: number, tags: string[]): Promise<void> {
        this.store.setLoading();
        try {
            const response = await firstValueFrom(this.api.updateUrl(id, { expiryDays, customCode, clickLimit, tags }));
            this.store.updateUrl(response.url);
            this.snackbar.showSuccess('URL updated successfully.');

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to update URL.';
            this.store.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    async fetchUserUrls(): Promise<void> {
        this.store.setLoading();
        try {
            const result = await firstValueFrom(this.api.getUserUrls());
            this.store.setUrl(result.urls);

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to load URLs.';
            this.store.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    async fetchUrlById(id: string): Promise<void> {
        this.store.setLoading();
        try {
            const response = await firstValueFrom(this.api.getUrlById(id));
            this.store.setSelectedUrl(response.url);

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to fetch URL.';
            this.store.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    async deleteUrl(id: string): Promise<void> {
        this.store.setLoading();
        try {
            await firstValueFrom(this.api.deleteUrl(id));
            this.store.removeUrl(id);

            this.snackbar.showSuccess('URL deleted successfully.');

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to delete URL.';
            this.store.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    async redirectToOriginalUrl(shortId: string): Promise<string | null> {
        try {
            const response = await firstValueFrom(this.api.redirectToOriginal(shortId));
            const originalUrl = response?.body?.originalUrl || response?.url;

            if (!originalUrl) {
                this.snackbar.showError('Original URL not found.');
                return null;
            }

            return originalUrl;
        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Unable to open link.';
            this.snackbar.showError(errorMessage);
            return null;
        }
    }

}