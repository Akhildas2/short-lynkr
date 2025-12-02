import { Notification } from "./notification.interface";

export interface NotificationState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
}

export const initialState: NotificationState = {
    notifications: [],
    loading: false,
    error: null,
};