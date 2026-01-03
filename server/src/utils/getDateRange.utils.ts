import { subHours, startOfDay, subDays } from 'date-fns';


/**
 * Calculates current and previous date ranges for analytics comparisons.
 * Useful for generating metrics like "this period vs previous period".
 */
export function getDateRange(range: string, now: Date): {
  currentFromDate: Date;
  currentToDate: Date;
  previousFromDate: Date;
  previousToDate: Date;
} {
  let days: number;
  if (range === '1d') {
    const currentToDate = now;
    const currentFromDate = subHours(now, 24);// Last 24 hours
    const previousToDate = currentFromDate;
    const previousFromDate = subHours(currentFromDate, 24);
    return { currentFromDate, currentToDate, previousFromDate, previousToDate };
  }

  if (range === '7d') days = 7;
  else if (range === '30d') days = 30;
  else days = 90;// Default to 90 days if range is unknown

  const currentToDate = now;
  const currentFromDate = startOfDay(subDays(now, days - 1));
  const previousToDate = currentFromDate;
  const previousFromDate = startOfDay(subDays(currentFromDate, days));

  return { currentFromDate, currentToDate, previousFromDate, previousToDate };
}