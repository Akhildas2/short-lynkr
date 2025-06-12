import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsChartComponent } from '../../../shared/components/analytics-chart/analytics-chart.component';

@Component({
  selector: 'app-analytics',
  imports: [SharedModule, HeaderComponent, FooterComponent, AnalyticsChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);
  urlList = this.urlStore.selectedUrl;
  constructor() { }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.urlEffects.fetchUrlById(id);
    }
  }

  get timelineData(): number[] {
    return this.urlList()?.timelineData ?? [];
  }

  get timelineLabels(): string[] {
    return this.urlList()?.timelineLabels ?? [];
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