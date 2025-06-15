import { format, subDays, startOfDay, addHours, startOfHour, startOfMonth } from 'date-fns';

export type Range = '1d' | '7d' | '30d' | '90d';

interface AnalyticsEntry {
  timestamp: Date;
}

export function generateTimelineData(entries: AnalyticsEntry[], range: string) {
  const now = new Date();

  if (range === '1d') {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours back
    const hoursMap: Record<string, number> = {};

    for (let i = 0; i < 24; i++) {
      const hour = new Date(start.getTime() + i * 60 * 60 * 1000);
      const label = format(hour, 'HH:00');
      hoursMap[label] = 0;
    }

    entries.forEach(({ timestamp }) => {
      const date = new Date(timestamp);
      const label = format(date, 'HH:00');
      if (label in hoursMap) hoursMap[label]++;
    });

    return {
      timelineLabels: Object.keys(hoursMap),
      timelineData: Object.values(hoursMap),
    };
  }

  if (range === '7d' || range === '30d') {
    const length = range === '7d' ? 7 : 30;
    const start = startOfDay(subDays(now, length - 1));
    const days: { label: string; count: number }[] = [];

    for (let i = 0; i < length; i++) {
      const date = subDays(startOfDay(now), length - 1 - i);
      days.push({ label: format(date, 'yyyy-MM-dd'), count: 0 });
    }

    const labelIndexMap = Object.fromEntries(days.map((d, idx) => [d.label, idx]));

    entries.forEach(({ timestamp }) => {
      const label = format(startOfDay(new Date(timestamp)), 'yyyy-MM-dd');
      const idx = labelIndexMap[label];
      if (idx !== undefined) days[idx].count++;
    });

    return {
      timelineLabels: days.map(d => d.label),
      timelineData: days.map(d => d.count),
    };
  }

  if (range === '90d') {
    const months: { label: string; count: number }[] = [];
    const monthMap = new Map<string, number>();

    for (let i = 3; i >= 0; i--) {
      const monthStart = startOfMonth(subDays(now, i * 30));
      const label = format(monthStart, 'yyyy-MM');
      months.push({ label, count: 0 });
      monthMap.set(label, months.length - 1);
    }

    entries.forEach(({ timestamp }) => {
      const label = format(new Date(timestamp), 'yyyy-MM');
      const idx = monthMap.get(label);
      if (idx !== undefined) months[idx].count++;
    });

    return {
      timelineLabels: months.map(m => m.label),
      timelineData: months.map(m => m.count),
    };
  }

  return { timelineLabels: [], timelineData: [] };
}
