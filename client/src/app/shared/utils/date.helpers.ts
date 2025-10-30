/**
 * Checks if a given date is today.
 * @param date - The date to check.
 * @returns True if the date is today, false otherwise.
 */
export function isToday(date: Date | string | null | undefined): boolean {
    if (!date) return false;

    const d = new Date(date);
    const today = new Date();

    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
}

/**
 * Formats a Date object into a string in 'HH:mm' format.
 * @param date - The Date object to format.
 * @returns A string representing the time in 'HH:mm'.
 */
export function getFormattedTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Parses a time value (string in 'HH:mm' or 'HH:mm:ss' format, or a Date object)
 * into its hour and minute components.
 * @param time - The time string or Date object.
 * @returns An object with hours and minutes, or null if invalid.
 */
export function parseTime(time: string | Date | null | undefined): { hours: number; minutes: number } | null {
    if (!time) return null;

    if (typeof time === 'string') {
        // Remove seconds if present, keep only HH:mm
        const cleanTime = time.split(' ')[0];
        const parts = cleanTime.split(':').map(Number);

        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            let hours = parts[0];
            const minutes = parts[1];

            // Convert AM/PM to 24-hour format if present
            if (time.toLowerCase().includes('pm') && hours < 12) hours += 12;
            if (time.toLowerCase().includes('am') && hours === 12) hours = 0;

            return { hours, minutes };
        }
    } else if (time instanceof Date) {
        return { hours: time.getHours(), minutes: time.getMinutes() };
    }

    return null;
}

/**
 * Combines a date with a time object into a single Date object.
 * @param date - The base date (Date object or date string).
 * @param time - Object containing hours and minutes.
 * @returns A new Date object with the combined date and time.
 */
export function combineDateAndTime(date: Date | string, time: { hours: number; minutes: number }): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), time.hours, time.minutes, 0, 0);
}

/**
 * Extracts the time portion ('HH:mm') from a Date object or date string.
 * @param date - The Date object or date string.
 * @returns A string representing the time in 'HH:mm', or empty string if date is null.
 */
export function getTimeString(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}