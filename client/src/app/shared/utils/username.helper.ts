import { AbstractControl } from '@angular/forms';
import { PLATFORM_BASE_URL } from './platform.helper';

// Validator to prevent full URL in username
export function usernameFullUrlValidator(control: AbstractControl) {
    if (!control.value) return null;
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(control.value) ? { fullUrl: true } : null;
}

// Get profile hint text
export function getProfileHint(platform: string, username: string | null) {
    if (!platform) return null;
    if (platform === 'Other') {
        return 'Enter the full URL of your profile (must start with http:// or https://)';
    }
    if (!username) {
        return `Base URL auto-filled: ${PLATFORM_BASE_URL[platform]}`;
    }
    return null;
}