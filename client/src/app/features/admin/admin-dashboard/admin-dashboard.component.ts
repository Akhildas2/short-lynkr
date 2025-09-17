import { Component, inject, OnInit } from '@angular/core';
import { AdminApiService } from '../../../core/services/api/admin/admin-api.service';
import { DashboardData } from '../../../models/dashboard/dashboard.interface';
import { SharedModule } from '../../../shared/shared.module';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { SummaryCardComponent } from '../../../shared/components/dashboard-widgets/summary-card/summary-card.component';
import { TimeRangeKey } from '../../../models/analytic/adminAnalytics.interface';
import { NoDataComponent } from '../../../shared/components/ui/no-data/no-data.component';
import { AnalyticsChartComponent } from '../../../shared/components/charts/analytics-chart/analytics-chart.component';
import { StatsListComponent } from '../../../shared/components/dashboard-widgets/stats-list/stats-list.component';
import { MapChartComponent } from '../../../shared/components/charts/map-chart/map-chart.component';
import { AnalyticsService } from '../../../shared/services/analytics/analytics.service';
import { PageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { TopCardComponent } from '../../../shared/components/ui/top-card/top-card.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message/error-message.component';
import { RangeContext, RangeService } from '../../../shared/services/range/range.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SharedModule, SpinnerComponent, SummaryCardComponent, PageHeaderComponent, NoDataComponent, AnalyticsChartComponent, StatsListComponent, MapChartComponent, TopCardComponent, ScrollButtonsComponent, RouterLink, ErrorMessageComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private analyticsService = inject(AnalyticsService);
  private rangeService = inject(RangeService);

  dashboardData: DashboardData | null = null;
  isLoading = false;
  error: string | null = 'error';
  selectedRange: TimeRangeKey = '1d';

  timeRanges: { [key: string]: string } = {
    '1d': '1d',
    '7d': '7d',
    '30d': '30d',
    '90d': '90d',
  };

  getContext(): RangeContext {
    return 'dashboard';
  }

  ngOnInit(): void {
    const storedRange = this.rangeService.getRange(this.getContext()) as TimeRangeKey;
    if (storedRange) {
      this.selectedRange = storedRange;
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.error = null;

    this.adminApi.getAdminDashboard(this.selectedRange).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  changeRange(range: TimeRangeKey): void {
    this.selectedRange = range;
    this.rangeService.setRange(this.getContext(), range);
    this.loadDashboard();
  }

  refreshData(): void {
    this.loadDashboard();
  }

  // Helper methods for UI
  getHealthStatus(): 'healthy' | 'warning' | 'critical' {
    if (!this.dashboardData) return 'healthy';

    const { systemHealth } = this.dashboardData;
    if (systemHealth.errorRate > 5) return 'critical';
    if (systemHealth.errorRate > 2) return 'warning';
    return 'healthy';
  }

  getHealthColor(): string {
    const status = this.getHealthStatus();
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    return `${days}d ${hours}h`;
  }

  getIconClasses(title: string): { bg: string; color: string } {
    const iconMap: { [key: string]: { bg: string; color: string } } = {
      // ==== USERS ====
      'Total Users': { bg: 'bg-blue-100 dark:bg-blue-900', color: 'text-blue-600 dark:text-blue-300' },
      'Active Users': { bg: 'bg-green-100 dark:bg-green-900', color: 'text-green-600 dark:text-green-300' },
      'Blocked Users': { bg: 'bg-red-100 dark:bg-red-900', color: 'text-red-600 dark:text-red-300' },
      'New Users': { bg: 'bg-sky-100 dark:bg-sky-900', color: 'text-sky-600 dark:text-sky-300' },

      // ==== URLS ====
      'Total URLs': { bg: 'bg-indigo-100 dark:bg-indigo-900', color: 'text-indigo-600 dark:text-indigo-300' },
      'Active URLs': { bg: 'bg-teal-100 dark:bg-teal-900', color: 'text-teal-600 dark:text-teal-300' },
      'Blocked URLs': { bg: 'bg-rose-100 dark:bg-rose-900', color: 'text-rose-600 dark:text-rose-300' },
      'New URLs': { bg: 'bg-cyan-100 dark:bg-cyan-900', color: 'text-cyan-600 dark:text-cyan-300' },

      // ==== QRs ====
      'Total QRs': { bg: 'bg-purple-100 dark:bg-purple-900', color: 'text-purple-600 dark:text-purple-300' },

      // ==== CLICKS & VISITORS ====
      'Total Clicks': { bg: 'bg-yellow-100 dark:bg-yellow-900', color: 'text-yellow-600 dark:text-yellow-300' },
      'Unique Visitors': { bg: 'bg-pink-100 dark:bg-pink-900', color: 'text-pink-600 dark:text-pink-300' },
      'Visitors Growth': { bg: 'bg-pink-100 dark:bg-pink-900', color: 'text-pink-600 dark:text-pink-300' },

      // ==== ENGAGEMENT ====
      'Avg Clicks/URL': { bg: 'bg-orange-100 dark:bg-orange-900', color: 'text-orange-600 dark:text-orange-300' },
      'Avg Clicks/User': { bg: 'bg-amber-100 dark:bg-amber-900', color: 'text-amber-600 dark:text-amber-300' },
      'Click Through Rate': { bg: 'bg-indigo-100 dark:bg-indigo-900', color: 'text-indigo-600 dark:text-indigo-300' },
      'User Engagement Rate': { bg: 'bg-pink-100 dark:bg-pink-900', color: 'text-pink-600 dark:text-pink-300' },

      // ==== SYSTEM ====
      'System Health': { bg: 'bg-gray-100 dark:bg-gray-700', color: this.getHealthColor() }
    };

    return iconMap[title] || { bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600 dark:text-gray-300' };
  }

  get hasTimelineData(): boolean {
    return this.dashboardData?.timeline?.datasets?.some(dataset =>
      dataset.data?.some((value: number) => value > 0)
    ) ?? false;
  }

  get countryStats(): { countryCode: string, value: number }[] {
    const countries = this.dashboardData?.geography.topCountries ?? [];
    return this.analyticsService.getCountryClickData(countries);
  }

  get topUsersStats() {
    const users = this.dashboardData?.topPerformers?.users || [];
    const totalClicks = users.reduce((sum, u) => sum + (u.totalClicks || 0), 0);

    return users.map(user => ({
      name: user.name || user.email,
      value: user.totalClicks,
      percentage: totalClicks > 0 ? Math.round((user.totalClicks / totalClicks) * 100) : 0,
      subtitle: `${user.urlCount} URLs • ${user.totalClicks} clicks`
    }));
  }

}