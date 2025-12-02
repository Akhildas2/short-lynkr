import { computed, Directive, inject, signal } from '@angular/core';
import { Notification, NotificationCategory, NotificationType } from '../../models/notification/notification.interface';
import { NotificationStore } from '../../state/notification/notification.store';
import { NotificationEffects } from '../../state/notification/notification.effects';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { getCategoryBadgeClass, getCategoryClass, getCategoryIcon, getIconClass, getIconName } from '../utils/notification.utils';
import { NotificationDialogComponent } from '../components/dialogs/notification-dialog/notification-dialog.component';
import { AlertDialogComponent } from '../components/dialogs/alert-dialog/alert-dialog.component';
import { AddNotificationDialogComponent } from '../components/dialogs/add-notification-dialog/add-notification-dialog.component';
import { AuthStore } from '../../state/auth/auth.store';

@Directive()
export abstract class BaseNotificationComponent {
    // injected dependencies used by all children
    protected notificationStore = inject(NotificationStore);
    protected notificationEffects = inject(NotificationEffects);
    protected dialog = inject(MatDialog);
    protected destroy$ = new Subject<void>();
    protected authStore = inject(AuthStore);

    // Signals
    currentFilter = signal<'all' | 'unread' | 'read' | NotificationCategory>('all');
    pageIndex = signal(0);
    pageSize = signal(6);

    // store-derived observables / signals
    notifications = this.notificationStore.notifications;
    totalUnread = this.notificationStore.unreadCount;
    totalRead = this.notificationStore.readCount;
    isLoading = this.notificationStore.isLoading;
    error = this.notificationStore.error;
    readonly latestFive = this.notificationStore.latestFive;

    // computed set of categories present in the current notifications list
    categories = computed(() => {
        const cats = new Set<string>();
        this.notifications().forEach(n => n.category && cats.add(n.category));
        return Array.from(cats) as NotificationCategory[];
    });

    // Utility functions to bind directly into templates
    getIconName = getIconName;
    getIconClass = getIconClass;
    getCategoryIcon = getCategoryIcon;
    getCategoryBadgeClass = getCategoryBadgeClass;
    getCategoryClass = getCategoryClass;

    /** Default lifecycle behaviour: load notifications */
    ngOnInit(): void {
        // Only load notifications if authenticated
        if (this.authStore.isAuthenticated()) {
            this.notificationEffects.loadNotifications();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** ---------------- shared helpers ---------------- */

    /** Filtering logic used by UIs */
    filteredNotifications(): Notification[] {
        let filtered = this.notifications();
        const filter = this.currentFilter();

        if (filter === 'read') {
            filtered = filtered.filter(n => n.read);
        } else if (filter === 'unread') {
            filtered = filtered.filter(n => !n.read);
        } else if (filter !== 'all') {
            filtered = filtered.filter(n => n.category === filter);
        }
        return filtered;
    }

    /** Pagination used by UIs */
    paginatedNotifications(): Notification[] {
        const filtered = this.filteredNotifications();
        const start = this.pageIndex() * this.pageSize();
        return filtered.slice(start, start + this.pageSize());
    }

    /** Total for paginator */
    get length(): number {
        return this.filteredNotifications().length;
    }

    /** Set filter (resets page index) */
    filterNotifications(filter: 'all' | 'unread' | NotificationCategory | 'read') {
        this.currentFilter.set(filter as any);
        this.pageIndex.set(0);
    }

    /** Page event handler */
    handlePageEvent(event: { pageIndex: number; pageSize: number }) {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
    }

    /** Mark a single notification as read and optionally open detail dialog.
     *  Accepts an optional dialog component to open (defaults to NotificationDialogComponent).
     */
    markAsRead(notification: Notification, dialogComponent: any = NotificationDialogComponent): void {
        if (!notification.read && notification._id) {
            this.notificationEffects.markAsRead(notification._id);
        }

        const dialogRef = this.dialog.open(dialogComponent, {
            width: '500px',
            data: notification,
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result?.deleted && result.id) {
                this.confirmDelete(result.id, notification.title);
            }
        });
    }

    /** Toggle all read/unread for current notifications in the store (all notifications, not just filtered) */
    toggleAllReadUnread(): void {
        const notifications = this.notificationStore.notifications();
        if (!notifications.length) return;

        const markAsRead = notifications.some(n => !n.read);
        const ids = notifications.map(n => n._id!).filter(Boolean);

        this.notificationEffects.toggleReadStatus(ids, markAsRead);
    }

    /** Confirm + delete one notification */
    deleteNotification(id: string, title?: string): void {
        this.confirmDelete(id, title);
    }

    /** Confirm delete helper */
    protected confirmDelete(id: string, title?: string) {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Delete Notification?',
                content: `Are you sure you want to delete this notification${title ? `: "${title}"` : ''}? This action cannot be undone.`,
                actionText: 'Delete',
                actionIcon: 'delete',
                confirmOnly: true,
            },
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.notificationEffects.deleteNotification(id);
            }
        });
    }

    /** Add notification using the shared AddNotificationDialogComponent */
    addNotification(dialogComponent: any = AddNotificationDialogComponent) {
        const dialogRef = this.dialog.open(dialogComponent, { width: '500px' });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.notificationEffects.createNotification(result);
            }
        });
    }

    /** Delete all notifications (asks confirm then deletes) */
    deleteAllNotifications(): void {
        const notifications = this.notificationStore.notifications();
        if (!notifications.length) return;

        const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Delete All Notifications?',
                content: `Are you sure you want to delete all notifications? This action cannot be undone.`,
                actionText: 'Delete All',
                actionIcon: 'delete_sweep',
                confirmOnly: true,
            },
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                const ids = notifications.map(n => n._id!).filter(Boolean);
                this.notificationEffects.deleteMultipleNotifications(ids);
            }
        });
    }

    /** Safe getters for optional values */
    getSafeType(type?: NotificationType): NotificationType {
        return type ?? NotificationType.Info;
    }

    getSafeCategory(category?: NotificationCategory | undefined): NotificationCategory {
        return category ?? NotificationCategory.System;
    }

}