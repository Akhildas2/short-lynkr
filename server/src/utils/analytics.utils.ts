//  Filter analytics between two dates ---
export function filterAnalyticsByRange(analytics: any[], from: Date, to: Date) {
    return analytics.filter(a => {
        const ts = new Date(a.timestamp);
        return ts >= from && ts < to;
    });
}

function normalizeStat(key: string, val: string, fallback = 'Unknown'): string {
    if (!val) return fallback;
    val = val.trim().toLowerCase();

    if (key === 'device') {
        if (val.includes('mobile')) return 'Mobile';
        if (val.includes('tablet') || val.includes('ipad')) return 'Tablet';
        if (val.includes('desktop') || val.includes('ubuntu') || val.includes('mac') || val.includes('linux') || val.includes('macintosh') || val.includes('laptop')) return 'Desktop';
        if (val.includes('bot') || val.includes('crawler') || val.includes('spider')) return 'Bot';
        return 'Other';
    }

    if (key === 'browser') {
        if (val.includes('chrome') && !val.includes('edge') && !val.includes('chromium')) return 'Chrome';
        if (val.includes('firefox')) return 'Firefox';
        if (val.includes('safari') && !val.includes('chrome')) return 'Safari';
        if (val.includes('edge')) return 'Edge';
        if (val.includes('opera') || val.includes('opr/')) return 'Opera';
        if (val.includes('brave')) return 'Brave';
        return 'Other';
    }

    if (key === 'os') {
        if (val.includes('windows')) return 'Windows';
        if (val.includes('android')) return 'Android';
        if (val.includes('iphone') || val.includes('ipad') || val.includes('ios')) return 'iOS';
        if (val.includes('mac os') || val.includes('macintosh')) return 'macOS';
        if (val.includes('ubuntu')) return 'Ubuntu';
        if (val.includes('linux')) return 'Linux';
        return 'Other';
    }

    if (key === 'referrer') {
        if (val === '' || val === 'direct' || val === '-') return 'Direct';
        if (val.includes('google')) return 'Google';
        if (val.includes('facebook')) return 'Facebook';
        if (val.includes('twitter') || val.includes('x.com')) return 'Twitter';
        if (val.includes('instagram')) return 'Instagram';
        if (val.includes('linkedin')) return 'LinkedIn';
        if (val.includes('youtube')) return 'YouTube';
        return 'Other';
    }

    // For country/region/city: convert to Title Case
    if (key === 'country' || key === 'region' || key === 'city') {
        return val
            .split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }

    return fallback;
}

export function aggregateStats<T extends Record<string, any>>(
    data: T[],
    key: keyof T,
    fallback = 'Unknown'
): Record<string, number> {
    return data.reduce((acc: Record<string, number>, a) => {
        let rawVal = (a[key] as string) || fallback;

        if (!rawVal || rawVal.trim() === '') {
            rawVal = fallback;
        }

        const normalized = normalizeStat(key as string, rawVal, fallback);
        acc[normalized] = (acc[normalized] || 0) + 1;
        return acc;
    }, {});
}

//  Calculate % change ---
export function getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
}

export function getTop(stats: Record<string, number>, limit: number) {
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));
}