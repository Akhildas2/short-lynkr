import { inject, Injectable } from "@angular/core";
import { AdminApiService } from "../../core/services/api/admin/admin-api.service";
import { AdminStore } from "./admin.store";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";
import { User } from "../../models/user/user.model";



@Injectable({ providedIn: 'root' })
export class AdminEffects {
    private api = inject(AdminApiService);
    private store = inject(AdminStore);
    private snackbar = inject(SnackbarService);

    // User Management
    async fetchAllUsers() {
        this.store.setLoading();
        try {
            const users = await firstValueFrom(this.api.getAllUsers());
            this.store.setUsers(users);

        } catch (error: any) {
            this.handleError(error, 'Failed to fetch users.');
        }
    }

    async addUser(user: Partial<User>) {
        this.store.setLoading();
        try {
            const createdUser = await firstValueFrom(this.api.addUser(user));
            this.store.addUser(createdUser);
            this.snackbar.showSuccess('User added successfully.');

        } catch (error: any) {
            this.handleError(error, 'Failed to add user.');
        }
    }

    async updateUser(id: string, user: Partial<User>) {
        this.store.setLoading();
        try {
            const updatedUser = await firstValueFrom(this.api.updateUser(id, user));
            this.store.updateUser(updatedUser);
            this.snackbar.showSuccess('User updated successfully.');

        } catch (error: any) {
            this.handleError(error, 'Failed to update user.');
        }
    }

    async toggleBlockUser(id: string, isBlocked: boolean) {
        this.store.setLoading();
        try {
            const updatedUser = await firstValueFrom(this.api.toggleBlockUser(id, isBlocked));
            this.store.updateUser(updatedUser);
            this.snackbar.showSuccess('User block status changed.');

        } catch (error: any) {
            this.handleError(error, 'Failed to block/unblock user.');
        }
    }

    async deleteUser(id: string) {
        this.store.setLoading();
        try {
            await firstValueFrom(this.api.deleteUser(id));
            this.store.removeUser(id);
            this.snackbar.showSuccess('User deleted successfully.');

        } catch (error: any) {
            this.handleError(error, 'Failed to delete user.');
        }
    }

    // URL Management
    async fetchAllUrls() {
        this.store.setLoading();
        try {
            const urls = await firstValueFrom(this.api.getAllUrls());
            this.store.setUrls(urls);
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch URLs.');
        }
    }

    async toggleBlockUrl(id: string, isBlocked: boolean) {
        this.store.setLoading();
        try {
            const updatedUrl = await firstValueFrom(this.api.toggleBlockUrl(id, isBlocked));
            this.store.updateUrl(updatedUrl);
            this.snackbar.showSuccess('URL block status changed.');
        } catch (error: any) {
            this.handleError(error, 'Failed to block/unblock URL.');
        }
    }

    async deleteUrl(id: string) {
        this.store.setLoading();
        try {
            await firstValueFrom(this.api.deleteUrl(id));
            this.store.removeUrl(id);
            this.snackbar.showSuccess('URL deleted successfully.');
        } catch (error: any) {
            this.handleError(error, 'Failed to delete URL.');
        }
    }

    private handleError(error: any, fallback: string) {
        const message = error?.error?.message || fallback;
        this.store.setError(message);
        this.snackbar.showError(message);
    }

}