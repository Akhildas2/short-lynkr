import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { StatsChartComponent } from '../../../shared/components/charts/stats-chart/stats-chart.component';
import { ActivityTableComponent } from '../../../shared/components/dashboard-widgets/activity-table/activity-table.component';
import { AnalyticsChartComponent } from '../../../shared/components/charts/analytics-chart/analytics-chart.component';
import { StatsListComponent } from '../../../shared/components/dashboard-widgets/stats-list/stats-list.component';
import { SummaryCardComponent } from '../../../shared/components/dashboard-widgets/summary-card/summary-card.component';
import { MapChartComponent } from '../../../shared/components/charts/map-chart/map-chart.component';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { ActivatedRoute } from '@angular/router';
import { zoomInAnimation } from '../../../shared/utils/animations.util';
import { AnalyticsEntry } from '../../../models/url/url.model';

type TimeRangeKey = '1d' | '7d' | '30d' | '90d';

@Component({
  selector: 'app-analytics',
  imports: [SharedModule, AnalyticsChartComponent, MapChartComponent, StatsChartComponent, StatsListComponent, SummaryCardComponent, ActivityTableComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  animations: [zoomInAnimation]
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);
  urlList = this.urlStore.selectedUrl;
  isLoading = false;
  deviceChartData: number[] = [];
  deviceChartLabels: string[] = [];
  osChartData: number[] = [];
  osChartLabels: string[] = [];
  displayedColumns: string[] = ['timestamp', 'location', 'device', 'referrer'];

  timeRanges: { [key: string]: string } = {
    '1d': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days'
  };
  selectedRange: TimeRangeKey = '1d';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id, this.selectedRange);
    }
  }

  private async loadData(id: string, range: TimeRangeKey) {
    this.isLoading = true;
    const fetchPromise = this.urlEffects.fetchUrlById(id, range);
    const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    await Promise.all([fetchPromise, delayPromise]);
    this.setChartData();
    this.setChartDataOs();
    this.isLoading = false;
  }

  async changeRange(range: TimeRangeKey) {
    this.selectedRange = range;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id, range);
    }
  }

  get timelineData(): number[] {
    return this.urlList()?.timelineData ?? [];
  }

  get timelineLabels(): string[] {
    return this.urlList()?.timelineLabels ?? [];
  }

  get hasTimelineClicks(): boolean {
    return this.timelineData.some(v => v > 0);
  }

  get countryClickData(): { countryCode: string, value: number }[] {
    const countryClicks = this.urlList()?.countryClicks ?? {};

    return Object.entries(countryClicks).map(([countryCode, value]) => ({
      countryCode,
      value: Number(value)
    })).sort((a, b) => b.value - a.value);
  }

  get referrerStats() {
    return this.urlList()?.referrerStats ?? [];
  }

  get deviceStats() {
    return this.urlList()?.deviceStats ?? [];
  }

  private setChartData() {
    const devices = this.deviceStats;
    this.deviceChartData = devices.map(d => d.percentage);
    this.deviceChartLabels = devices.map(d => d.name);
  }

  get browserStats() {
    return this.urlList()?.browserStats ?? [];
  }

  get osStats() {
    return this.urlList()?.osStats ?? [];
  }

  private setChartDataOs() {
    const os = this.osStats;
    this.osChartData = os.map(d => d.percentage);
    this.osChartLabels = os.map(d => d.name);
  }

  get recentActivity(): AnalyticsEntry[] {
    const analytics = this.urlList()?.analytics ?? [];
    return analytics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
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

  get deviceGridClass(): string {
    return this.getGridClass(this.deviceStats.length);
  }

  get osGridClass(): string {
    return this.getGridClass(this.osStats.length);
  }

  get countryGridClass(): string {
    const topCountries = this.countryClickData.slice(0, 3);
    return this.getGridClass(topCountries.length);
  }

  private getGridClass(count: number): string {
    if (count === 1) return 'grid grid-cols-1 justify-center';
    if (count === 2) return 'grid grid-cols-2';
    if (count === 3) return 'grid grid-cols-3';
    if (count === 4) return 'grid grid-cols-2 md:grid-cols-4';
    if (count === 5) return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6'; // 6 or more
  }

  browserIconMap: Record<string, string> = {
    Chrome: 'language',
    Firefox: 'travel_explore',
    Safari: 'explore',
    Edge: 'web_asset',
    Opera: 'tune',
    Other: 'public',
  };

  referrerIconMap: Record<string, string> = {
    Direct: 'link',
    Google: 'search',
    Facebook: 'facebook',
    Twitter: 'alternate_email',
    Instagram: 'photo_camera',
    LinkedIn: 'work',
    Other: 'travel_explore'
  };

  deviceIconMap: Record<string, string> = {
    mobile: 'smartphone',
    desktop: 'desktop_windows',
    tablet: 'tablet',
    bot: 'smart_toy',
    other: 'devices'
  };

}