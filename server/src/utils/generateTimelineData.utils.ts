import { format, subDays, startOfDay, subHours } from 'date-fns';

/** Allowed ranges for timeline aggregation */
export type Range = '1d' | '7d' | '30d' | '90d';

/** Analytics entry structure */
export interface AnalyticsEntry {
  timestamp: Date;
}

/**
 * Generates timeline data for analytics visualization.
 * Supports hourly aggregation for 1 day and daily/weekly aggregation for longer ranges.
 */
export function generateTimelineData(entries: AnalyticsEntry[], range: string) {
  const now = new Date();

  if (range === '1d') {
    // Generate 24 hourly buckets for the last 24 hours
    const hoursMap: Record<string, number> = {};
    const labels: string[] = [];

    // Create 24 hourly buckets
    for (let i = 23; i >= 0; i--) {
      const hour = subHours(now, i);
      const label = format(hour, 'HH:00');
      labels.push(label);
      hoursMap[label] = 0;
    }

    // Count entries in each hour bucket
    entries.forEach(({ timestamp }) => {
      const entryTime = new Date(timestamp);
      const label = format(entryTime, 'HH:00');
      if (label in hoursMap) {
        hoursMap[label]++;
      }
    });

    return {
      timelineLabels: labels,
      timelineData: labels.map(label => hoursMap[label]),
    };
  }

  if (range === '7d') {
    // Generate 7 daily buckets
    const days: { label: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(now, i));
      days.push({
        label: format(date, 'MM/dd'), // Short format for 7-day view
        count: 0
      });
    }

    const labelIndexMap = Object.fromEntries(
      days.map((d, idx) => [format(subDays(startOfDay(now), 6 - idx), 'yyyy-MM-dd'), idx])
    );

    entries.forEach(({ timestamp }) => {
      const dayLabel = format(startOfDay(new Date(timestamp)), 'yyyy-MM-dd');
      const idx = labelIndexMap[dayLabel];
      if (idx !== undefined) {
        days[idx].count++;
      }
    });

    return {
      timelineLabels: days.map(d => d.label),
      timelineData: days.map(d => d.count),
    };
  }

  if (range === '30d') {
    // Generate 30 daily buckets
    const days: { label: string; count: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(now, i));
      days.push({
        label: format(date, 'MM/dd'),
        count: 0
      });
    }

    const labelIndexMap = Object.fromEntries(
      days.map((d, idx) => [format(subDays(startOfDay(now), 29 - idx), 'yyyy-MM-dd'), idx])
    );

    entries.forEach(({ timestamp }) => {
      const dayLabel = format(startOfDay(new Date(timestamp)), 'yyyy-MM-dd');
      const idx = labelIndexMap[dayLabel];
      if (idx !== undefined) {
        days[idx].count++;
      }
    });

    return {
      timelineLabels: days.map(d => d.label),
      timelineData: days.map(d => d.count),
    };
  }

  if (range === '90d') {
    // For 90 days
    const weeks: { label: string; count: number }[] = [];
    const weeksCount = 13; // ~90 days / 7 = ~13 weeks

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = startOfDay(subDays(now, i * 7));
      weeks.push({
        label: format(weekStart, 'MM/dd'),
        count: 0
      });
    }

    entries.forEach(({ timestamp }) => {
      const entryDate = new Date(timestamp);
      const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(daysDiff / 7);

      if (weekIndex >= 0 && weekIndex < weeksCount) {
        const reversedIndex = weeksCount - 1 - weekIndex;
        if (weeks[reversedIndex]) {
          weeks[reversedIndex].count++;
        }
      }
    });

    return {
      timelineLabels: weeks.map(w => w.label),
      timelineData: weeks.map(w => w.count),
    };
  }

  return { timelineLabels: [], timelineData: [] };
}