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
import { zoomInAnimation } from '../../../shared/utils/animations.util';
import { UrlEntry } from '../../../models/url/url.model';
import { BaseAnalyticsComponent } from '../../../shared/utils/base-analytics.component';
import { TimeRangeKey } from '../../../models/analytic/adminAnalytics.interface';
import { RangeContext } from '../../../shared/services/range/range.service';
import { NoDataComponent } from '../../../shared/components/ui/no-data/no-data.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { PageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';

@Component({
  selector: 'app-analytics',
  imports: [SpinnerComponent, ScrollButtonsComponent, SharedModule, AnalyticsChartComponent, MapChartComponent, StatsChartComponent, StatsListComponent, SummaryCardComponent, ActivityTableComponent, NoDataComponent, PageHeaderComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  animations: [zoomInAnimation]
})
export class AnalyticsComponent extends BaseAnalyticsComponent implements OnInit {
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

  get urlList() {
    return this.urlStore.selectedUrl();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
  }

  getContext(): RangeContext {
    return 'user';
  }

  getAnalyticsData(): UrlEntry | null {
    return this.urlList;
  }

  loadAnalytics(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loadData(id, this.selectedRange);
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


}