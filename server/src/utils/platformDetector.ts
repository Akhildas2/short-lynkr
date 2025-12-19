export const detectPlatform = (
    userAgent: string
): 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown' => {

    const ua = userAgent.toLowerCase();

    if (/windows nt/.test(ua)) return 'Windows';
    if (/macintosh|mac os x/.test(ua)) return 'macOS';
    if (/android/.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
    if (/linux/.test(ua)) return 'Linux';

    return 'Unknown';
};