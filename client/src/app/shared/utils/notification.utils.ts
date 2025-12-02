import { NotificationType } from "../../models/notification/notification.interface";

/**
 * Get Material icon name based on notification type
 */
export function getIconName(type: NotificationType): string {
    switch (type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'notifications_none';
    }
}

/**
 * Get text color class based on notification type
 */
export function getIconClass(type: NotificationType): string {
    switch (type) {
        case 'success': return 'text-green-700 dark:text-green-500';
        case 'error': return 'text-red-600 dark:text-red-500';
        case 'warning': return 'text-yellow-600 dark:text-yellow-500';
        case 'info': return 'text-blue-600 dark:text-blue-500';
        default: return 'text-gray-600 dark:text-gray-500';
    }
}

/**
 * Get Material icon for notification category
 */
export function getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
        case 'user': return 'person';
        case 'url': return 'link';
        case 'settings': return 'settings';
        case 'system': return 'storage';
        case 'qr': return 'qr_code';
        default: return 'label';
    }
}

/**
 * Get badge CSS classes based on notification category
 */
export function getCategoryBadgeClass(category: string): string {
    switch (category.toLowerCase()) {
        case 'user': return 'bg-green-500 dark:bg-green-700';
        case 'url': return 'bg-red-500 dark:bg-red-700';
        case 'settings': return 'bg-yellow-500 dark:bg-yellow-700';
        case 'system': return 'bg-blue-500 dark:bg-blue-700';
        case 'qr': return 'bg-indigo-500 dark:bg-indigo-700';
        default: return 'bg-gray-500 dark:bg-gray-700';
    }
}

export function getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
        case 'user': return 'text-green-700 dark:text-green-500';
        case 'url': return 'text-red-600 dark:text-red-500';
        case 'settings': return 'text-yellow-600 dark:text-yellow-500';
        case 'system': return 'text-blue-600 dark:text-blue-500';
        case 'qr': return 'text-indigo-600 dark:text-indigo-500';
        default: return 'text-gray-600 dark:text-gray-500';
    }
}