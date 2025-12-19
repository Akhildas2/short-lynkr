export const detectDevice = (userAgent: string): 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' => {
    const ua = userAgent.toLowerCase();

    if (/tablet|ipad/.test(ua)) return 'Tablet';
    if (/mobile|android|iphone/.test(ua)) return 'Mobile';
    if (ua) return 'Desktop';

    return 'Unknown';
};