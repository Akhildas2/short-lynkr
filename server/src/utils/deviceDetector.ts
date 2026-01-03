/**
 * Detects the type of device based on the user agent string.
 */
export const detectDevice = (userAgent: string): 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' => {
    const ua = userAgent.toLowerCase();// Normalize to lowercase

    if (/tablet|ipad/.test(ua)) return 'Tablet';
    if (/mobile|android|iphone/.test(ua)) return 'Mobile';
    if (ua) return 'Desktop';

    return 'Unknown';
};