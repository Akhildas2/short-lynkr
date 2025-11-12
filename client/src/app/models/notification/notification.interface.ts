export enum NotificationType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

export enum NotificationCategory {
    User = 'user',
    Url = 'url',
    Qr = 'qr',
    System = 'system',
    Settings = 'settings'
}

export interface Notification {
    _id?: string;
    userId?: string | null;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    read?: boolean;
    forAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}