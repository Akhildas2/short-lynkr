import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics-chart',
  imports: [BaseChartDirective],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss'
})
export class AnalyticsChartComponent implements OnChanges {
  @Input() chartType: 'line' | 'bar' | 'pie' | 'doughnut' = 'line';
  @Input() data: any[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = '';

  // Chart configuration
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: this.title }
    }
  };

  public chartData: any = [];
  public chartPlugins = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels'] || changes['chartType']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartData = [{
      label: this.title,
      data: this.data,
      backgroundColor: this.getBackgroundColors(),
      borderColor: '#4f46e5',
      borderWidth: 2,
      fill: this.chartType === 'line'
    }];

    this.chartOptions.plugins!.title!.text = this.title;
  }

  private getBackgroundColors(): string[] {
    switch (this.chartType) {
      case 'pie':
      case 'doughnut':
        return [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ];
      default:
        return ['rgba(79, 70, 229, 0.2)'];
    }
  }
}
