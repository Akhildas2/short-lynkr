import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../core/services/api/notification/notification.service';
import { NotificationStore } from './notification.store';
import { SnackbarService } from '../../shared/services/snackbar/snackbar.service';
import { Notification } from '../../models/notification/notification.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationEffects {
    private api = inject(NotificationService);
    private store = inject(NotificationStore);
    private snackbar = inject(SnackbarService);

    constructor() {
        this.listenToSocket();
    }

    /** Load all notifications */
    async loadNotifications(): Promise<void> {
        this.store.setLoading(true);
        try {
            const notifications = await firstValueFrom(this.api.getNotifications());
            this.store.setNotifications(notifications);
        } catch {
            this.store.setError('Failed to load notifications');
            this.snackbar.showError('Failed to load notifications');
        }
    }


    /** Mark a single notification as read */
    async markAsRead(id: string): Promise<void> {
        try {
            const updatedNotification = await firstValueFrom(this.api.markAsRead(id));
            this.store.updateNotification({ ...updatedNotification, read: true });
        } catch {
            this.store.setError('Failed to mark notification as read');
            this.snackbar.showError('Failed to mark notification as read');
        }
    }


    /** Toggle multiple notifications read/unread */
    async toggleReadStatus(ids: string[], read: boolean): Promise<void> {
        if (!ids.length) return;
        try {
            await firstValueFrom(this.api.toggleReadStatus(ids, read));
            const updated = this.store.notifications().map(n =>
                ids.includes(n._id!) ? { ...n, read } : n
            );
            this.store.setNotifications(updated);
        } catch {
            this.store.setError('Failed to update read/unread status');
            this.snackbar.showError('Failed to update read/unread status');
        }
    }


    /** Delete a single notification */
    async deleteNotification(id: string): Promise<void> {
        try {
            await firstValueFrom(this.api.deleteNotification(id));
            this.store.removeNotification(id);
            this.snackbar.showSuccess('Notification deleted');
        } catch {
            this.store.setError('Failed to delete notification');
            this.snackbar.showError('Failed to delete notification');
        }
    }


    /** Delete multiple notifications */
    async deleteMultipleNotifications(ids: string[]): Promise<void> {
        if (!ids.length) return;

        try {
            await firstValueFrom(this.api.deleteMultipleNotifications(ids));
            ids.forEach(id => this.store.removeNotification(id));
            this.snackbar.showSuccess('All selected notifications have been deleted');
        } catch {
            this.store.setError('Failed to delete notifications');
            this.snackbar.showError('Failed to delete notifications');
        }
    }


    /** Create a new notification */
    async createNotification(notification: Partial<Notification>): Promise<void> {
        try {
            const newNotification = await firstValueFrom(this.api.createNotification(notification));
            this.store.addNotification(newNotification);
            this.snackbar.showSuccess('Notification sent');
        } catch {
            this.store.setError('Failed to create notification');
            this.snackbar.showError('Failed to create notification');
        }
    }


    /** Listen to live updates via WebSocket */
    private listenToSocket(): void {
        this.api.onNotification().subscribe((notification) => {
            if (!notification) return;

            // Deletion signal (has _id but no title)
            if (notification._id && !notification.title) {
                this.store.removeNotification(notification._id);
                return;
            }

            // Add or update notification
            if (notification._id) {
                const existing = this.store.notifications().find(n => n._id === notification._id);
                if (existing) {
                    this.store.updateNotification(notification);
                } else {
                    this.store.addNotification(notification);
                    this.snackbar.showInfo(`${notification.title}`);
                }
            }
        });
    }


}