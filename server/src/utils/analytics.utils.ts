
interface AnalyticsEntry {
    country?: string;
}

//  Filter analytics between two dates ---
export function filterAnalyticsByRange(analytics: any[], from: Date, to: Date) {
    return analytics.filter(a => {
        const ts = new Date(a.timestamp);
        return ts >= from && ts < to;
    });
}

//  Calculate % change ---
export function getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
}

//  Get top country and percentage ---
export function getTopCountryInfo(
    analytics: AnalyticsEntry[],
    totalClicks: number
): { topCountry: string; topCountryPercentage: number } {
    // Count clicks per country
    const countryCounts: Record<string, number> = analytics.reduce((acc, { country }) => {
        if (country && country !== 'undefined') {
            acc[country] = (acc[country] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // Sort countries by click count descending
    const sorted: [string, number][] = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);

    // Safely extract top country
    const entry = sorted[0] as [string, number] | undefined;
    const topCountry = entry?.[0] ?? 'Unknown';
    const count = entry?.[1] ?? 0;

    // Calculate percentage
    const topCountryPercentage =
        totalClicks > 0 ? Math.round((count / totalClicks) * 1000) / 10 : 0;

    return { topCountry, topCountryPercentage };
}