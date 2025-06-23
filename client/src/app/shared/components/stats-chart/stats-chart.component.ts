import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { AnalyticsChartComponent } from '../analytics-chart/analytics-chart.component';

@Component({
  selector: 'app-stats-chart',
  imports: [SharedModule, AnalyticsChartComponent],
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
  @Input() emptyText = 'No data available.';
  @Input() gridClass = '';

}
