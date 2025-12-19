export const CONTACT_STATUS_CLASS = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
} as const;

export const CONTACT_FILTER_TEXT_CLASS = {
    active: 'text-green-600',
    pending: 'text-yellow-600',
    closed: 'text-red-600',
    all: 'text-gray-600'
} as const;