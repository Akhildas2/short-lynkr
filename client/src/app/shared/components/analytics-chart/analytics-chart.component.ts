import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-analytics-chart',
  imports: [BaseChartDirective],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss'
})
export class AnalyticsChartComponent implements OnChanges {
  @Input() chartType: ChartType = 'line';
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = '';

  public chartData: ChartData<'line' | 'bar' | 'pie' | 'doughnut'> = {
    labels: [],
    datasets: []
  };

  // Chart configuration
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: this.title
      }
    }
  };

  public chartPlugins = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels'] || changes['chartType'] || changes['title']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartData = {
      labels: this.labels,
      datasets: [{
        label: this.title,
        data: this.data,
        backgroundColor: this.getBackgroundColors(),
        borderColor: '#4f46e5',
        borderWidth: 2,
        fill: this.chartType === 'line' // only fill area for line chart
      }]
    };

    if (this.chartOptions.plugins?.title) {
      this.chartOptions.plugins.title.text = this.title;
    }
  }

  private getBackgroundColors(): string[] {
    if (this.chartType === 'pie' || this.chartType === 'doughnut') {
      return [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ];
    }
    return ['rgba(79, 70, 229, 0.2)'];
  }
}
