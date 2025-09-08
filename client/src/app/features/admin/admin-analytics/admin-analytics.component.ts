import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { StatsListComponent } from '../../../shared/components/dashboard-widgets/stats-list/stats-list.component';
import { StatsChartComponent } from '../../../shared/components/charts/stats-chart/stats-chart.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { MapChartComponent } from '../../../shared/components/charts/map-chart/map-chart.component';
import { AnalyticsChartComponent } from '../../../shared/components/charts/analytics-chart/analytics-chart.component';
import { SummaryCardComponent } from '../../../shared/components/dashboard-widgets/summary-card/summary-card.component';
import { BaseAnalyticsComponent } from '../../../shared/utils/base-analytics.component';
import { AdminApiService } from '../../../core/services/api/admin/admin-api.service';
import { AdminAnalytics } from '../../../models/analytic/adminAnalytics.interface';
import { ActivityTableComponent } from '../../../shared/components/dashboard-widgets/activity-table/activity-table.component';
import { NoDataComponent } from '../../../shared/components/ui/no-data/no-data.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { RangeContext } from '../../../shared/services/range/range.service';

@Component({
  selector: 'app-admin-analytics',
  imports: [SharedModule, StatsListComponent, StatsChartComponent, SpinnerComponent, MapChartComponent, AnalyticsChartComponent, SummaryCardComponent, ActivityTableComponent, NoDataComponent, ScrollButtonsComponent],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.scss'
})
export class AdminAnalyticsComponent extends BaseAnalyticsComponent implements OnInit {
  private adminApiService = inject(AdminApiService);
  analyticsData: AdminAnalytics | null = null;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getContext(): RangeContext {
    return 'admin';
  }

  getAnalyticsData(): AdminAnalytics | null {
    return this.analyticsData;
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.error = null;

    setTimeout(() => {
      this.adminApiService.getAdminAnalytics(this.selectedRange).subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.isLoading = false;
          this.setChartData();
          this.setChartDataOs();
        },
        error: () => {
          this.error = 'Failed to load analytics data. Please try again.';
          this.isLoading = false;
        }
      });
    }, 1000);
  }

  get topUrlsWithClicks() {
    return this.analyticsData?.topUrls?.filter(url => url.clicks > 0) ?? [];
  }

  get combinedTimelineData() {
    return [
      { label: 'Users', data: this.analyticsData?.combinedTimeline?.users ?? [], borderColor: '#4f46e5' },
      { label: 'Blocked Users', data: this.analyticsData?.combinedTimeline?.blockedUsers ?? [], borderColor: '#ef4444' },
      { label: 'URLs', data: this.analyticsData?.combinedTimeline?.urls ?? [], borderColor: '#10b981' },
      { label: 'Blocked URLs', data: this.analyticsData?.combinedTimeline?.blockedUrls ?? [], borderColor: '#f59e0b' }
    ];
  }

  get combinedTimelineLabels() {
    return this.analyticsData?.combinedTimeline?.labels ?? [];
  }

  get hasCombinedTimelineData(): boolean {
    const datasets = this.combinedTimelineData;
    // Return true if any dataset has at least one non-zero value
    return datasets.some(dataset =>
      Array.isArray(dataset.data) && dataset.data.some(value => value > 0)
    );
  }



}