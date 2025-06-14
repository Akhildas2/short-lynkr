export function groupAnalyticsByRange(
  analytics: { timestamp: string | Date }[],
  range: string
): { labels: string[]; data: number[] } {
  const now = new Date();
  const timeSeries: Record<string, number> = {};

  // Count clicks per time bucket
  analytics.forEach(entry => {
    const dateObj = new Date(entry.timestamp);
    let key: string;

    if (range === '1d') {
      key = dateObj.toISOString().slice(11, 13) + ':00'; // Hour
    } else if (range === '90d') {
      key = dateObj.toISOString().slice(0, 7); // Month
    } else {
      key = dateObj.toISOString().slice(0, 10); // Day
    }

    timeSeries[key] = (timeSeries[key] || 0) + 1;
  });

  const labels: string[] = [];

  if (range === '1d') {
    // Last 24 hours: hourly range (today only)
    for (let i = 0; i < 24; i++) {
      labels.push(`${i.toString().padStart(2, '0')}:00`);
    }
  } else if (range === '90d') {
    // Last 90 days: generate month labels for 3 months ending this month
    const months = new Set<string>();
    for (let i = 0; i < 90; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 7);
      months.add(key);
    }
    labels.push(...Array.from(months).reverse());
  } else {
    // 7d or 30d: generate daily labels from today to N days back
    const dayCount = range === '30d' ? 30 : 7;
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(date.toISOString().slice(0, 10));
    }
  }

  const data = labels.map(label => timeSeries[label] || 0);
  return { labels, data };
}
