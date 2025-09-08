import { AnalyticsEntry } from "../url/url.model";

export interface BaseAnalyticsData {
  analytics?: AnalyticsEntry[];
  clicksChange?: number;
  visitorsChange?: number;
  timeline?: { data: number[]; labels: string[] };
  topReferrers?: Array<{ name: string; count: number }>;
  topBrowsers?: Array<{ name: string; count: number }>;
  topDevices?: Array<{ name: string; count: number }>;
  topOS?: Array<{ name: string; count: number }>;
  topCountries?: Array<{ name: string; count: number }>;
  topRegions?: Array<{ name: string; count: number }>;
  topCities?: Array<{ name: string; count: number }>;
}
