import { Injectable } from '@angular/core';
import { StatItem } from '../../../models/analytic/adminAnalytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  timeRanges: { [key: string]: string } = {
    '1d': '1d',
    '7d': '7d',
    '30d': '30d',
    '90d': '90d',
  };

  browserIconMap: Record<string, string> = {
    Chrome: 'fab fa-chrome',
    Firefox: 'fab fa-firefox-browser',
    Safari: 'fab fa-safari',
    Edge: 'fab fa-edge',
    Opera: 'fab fa-opera',
    Brave: 'fas fa-mask',
    Other: 'fas fa-question-circle',
  };

  referrerIconMap: Record<string, string> = {
    Direct: 'fas fa-link',
    Google: 'fab fa-google',
    Facebook: 'fab fa-facebook',
    Twitter: 'fab fa-twitter',
    x: 'fab fa-twitter',
    Instagram: 'fab fa-instagram',
    LinkedIn: 'fab fa-linkedin',
    YouTube: 'fab fa-youtube',
    Other: 'fas fa-globe',
  };

  deviceIconMap: Record<string, string> = {
    Mobile: 'fas fa-mobile-alt',
    Desktop: 'fas fa-desktop',
    Tablet: 'fas fa-tablet-alt',
    Bot: 'fas fa-robot',
    Other: 'fas fa-laptop',
  };

  osIconMap: Record<string, string> = {
    Windows: 'fab fa-windows',
    Android: 'fab fa-android',
    iOS: 'fab fa-apple',
    macOS: 'fab fa-apple',
    Ubuntu: 'fab fa-ubuntu',
    Linux: 'fab fa-linux',
    Other: 'fas fa-server',
  };


  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  calculateStats(data: Array<{ name: string; count: number }>): StatItem[] {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map(item => ({
      name: item.name,
      value: item.count,
      percentage: this.getPercentage(item.count, total)
    }));
  }

  getGridClass(count: number): string {
    if (count === 1) return 'grid grid-cols-1 justify-center';
    if (count === 2) return 'grid grid-cols-2';
    if (count === 3) return 'grid grid-cols-3';
    if (count === 4) return 'grid grid-cols-2 md:grid-cols-4';
    if (count === 5) return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  }

  getRangeComparisonText(range: string): string {
    const comparisonTexts: Record<string, string> = {
      '1d': 'from yesterday',
      '7d': 'from last 7 days',
      '30d': 'from last 30 days',
      '90d': 'from last 90 days'
    };
    return comparisonTexts[range] || 'from previous period';
  }

  getCountryClickData(countries: Array<{ name: string; count: number }>): { countryCode: string, value: number }[] {
    return countries.map(c => ({
      countryCode: c.name,
      value: c.count
    })).sort((a, b) => b.value - a.value);
  }

}