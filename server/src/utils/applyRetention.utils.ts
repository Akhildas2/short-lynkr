/**
 * Applies a retention policy to analytics data by filtering out older entries.
 */
export function applyRetention(analytics: any[], retentionDays: number) {
    if (!retentionDays || retentionDays <= 0) return analytics; // keep all
    const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return analytics.filter(a => new Date(a.timestamp) >= threshold);
}