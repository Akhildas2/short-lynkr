import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Notification } from '../../models/notification/notification.interface';
import { initialState } from '../../models/notification/notification-state.model';

export const NotificationStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed(({ notifications, loading }) => ({
        readCount: computed(() => notifications().filter(n => n.read).length),
        unreadCount: computed(() => notifications().filter(n => !n.read).length),
        hasNotifications: computed(() => notifications().length > 0),
        latestFive: computed(() => notifications().slice(0, 5)),
        isLoading: computed(() => loading()),
    })),

    withMethods((store) => ({
        setLoading(loading: boolean) {
            patchState(store, { loading, error: null });
        },

        setError(error: string) {
            patchState(store, { error, loading: false });
        },

        clearError() {
            patchState(store, { error: null });
        },

        setNotifications(notifications: Notification[]) {
            patchState(store, { notifications, loading: false, error: null });
        },

        addNotification(notification: Notification) {
            patchState(store, { notifications: [notification, ...store.notifications()] });
        },

        updateNotification(updated: Notification) {
            const updatedList = store.notifications().map(n =>
                n._id === updated._id ? { ...n, ...updated } : n
            );
            patchState(store, { notifications: updatedList });
        },

        removeNotification(id: string) {
            const updated = store.notifications().filter(n => n._id !== id);
            patchState(store, { notifications: updated });
        },

        clearNotifications() {
            patchState(store, { notifications: [] });
        },
    }))
);