import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsChartComponent } from '../../../shared/components/analytics-chart/analytics-chart.component';
import { MapChartComponent } from '../../../shared/components/map-chart/map-chart.component';
import { trigger, style, animate, transition } from '@angular/animations';

type TimeRangeKey = '1d' | '7d' | '30d' | '90d';

@Component({
  selector: 'app-analytics',
  imports: [SharedModule, HeaderComponent, FooterComponent, AnalyticsChartComponent, MapChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);
  urlList = this.urlStore.selectedUrl;
  isTimelineLoading = false;
  deviceChartData: number[] = [];
  deviceChartLabels: string[] = [];


  timeRanges: { [key: string]: string } = {
    '1d': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days'
  };
  selectedRange: TimeRangeKey = '1d';

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isTimelineLoading = true;

      const fetchPromise = this.urlEffects.fetchUrlById(id, this.selectedRange);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([fetchPromise, delayPromise]);
      this.setChartData();
      this.isTimelineLoading = false;
    }
  }

  async changeRange(range: TimeRangeKey) {
    this.selectedRange = range;
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isTimelineLoading = true;

      const fetchPromise = this.urlEffects.fetchUrlById(id, range);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([fetchPromise, delayPromise]);

      this.isTimelineLoading = false;
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
    }));
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

  getRangeComparisonText(range: string): string {
    const comparisonTexts: Record<string, string> = {
      '1d': 'from yesterday',
      '7d': 'from last 7 days',
      '30d': 'from last 30 days',
      '90d': 'from last 90 days'
    };
    return comparisonTexts[range] || 'from previous period';
  }

  displayedColumns: string[] = ['timestamp', 'location', 'device', 'referrer'];
  recentActivity = [
    {
      timestamp: new Date(),
      location: 'New York, US',
      device: 'iPhone',
      deviceIcon: 'phone_iphone',
      referrer: 'Instagram'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      location: 'London, UK',
      device: 'Chrome Desktop',
      deviceIcon: 'desktop_windows',
      referrer: 'Google Search'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      location: 'Berlin, DE',
      device: 'Android Phone',
      deviceIcon: 'android',
      referrer: 'Twitter'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      location: 'Tokyo, JP',
      device: 'Safari Desktop',
      deviceIcon: 'desktop_mac',
      referrer: 'Direct'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      location: 'Sydney, AU',
      device: 'iPad',
      deviceIcon: 'tablet_mac',
      referrer: 'Email'
    }
  ];
}