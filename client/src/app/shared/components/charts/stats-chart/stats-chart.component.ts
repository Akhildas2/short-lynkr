import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { AnalyticsChartComponent } from '../analytics-chart/analytics-chart.component';
import { NoDataComponent } from '../../ui/no-data/no-data.component';

@Component({
  selector: 'app-stats-chart',
  imports: [SharedModule, AnalyticsChartComponent, NoDataComponent],
  templateUrl: './stats-chart.component.html',
  styleUrl: './stats-chart.component.scss'
})
export class StatsChartComponent {
  @Input() title = '';
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() chartType: 'doughnut' | 'pie' = 'doughnut';
  @Input() loading = false;
  @Input() valueData: { name: string; percentage: number; value: number }[] = [];
  @Input() gridClass = '';
  @Input() iconMap: Record<string, string> = {};
  @Input() fallbackIcon: string = '';
  @Input() noDataIcon: string = 'info';
  @Input() noDataVariant: 'card' | 'overlay' = 'overlay';
  @Input() noDataTitle: string = 'No data available';
  @Input() noDataDescription: string = 'Nothing to show right now.';

}