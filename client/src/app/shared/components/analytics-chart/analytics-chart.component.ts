import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SharedModule } from '../../shared.module';
import { SpinnerComponent } from '../spinner/spinner.component';


@Component({
  selector: 'app-analytics-chart',
  imports: [BaseChartDirective, SharedModule, SpinnerComponent],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsChartComponent implements OnChanges {
  @Input() chartType: ChartType = 'line';
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = '';
  @Input() loading: boolean = false;

  public chartData: ChartData<'line' | 'bar' | 'pie' | 'doughnut'> = {
    labels: [],
    datasets: []
  };

  private isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }

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
    const dark = this.isDarkMode();

    // Background and styling colors
    const tickColor = dark ? '#f9fafb' : '#A9A9A9';
    const gridColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const titleColor = dark ? '#f9fafb' : '#A9A9A9';
    const legendColor = dark ? '#f9fafb' : '#A9A9A9';

    // Shared chart options
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: legendColor
          }
        },
        title: {
          display: true,
          text: this.title,
          color: titleColor
        }
      }
    };

    // Axis configuration only for line/bar charts
    if (this.chartType === 'line' || this.chartType === 'bar') {
      this.chartOptions.scales = {
        x: {
          ticks: { color: tickColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: tickColor },
          grid: { color: gridColor }
        }
      };
    } else {
      delete this.chartOptions.scales; // Remove axis for doughnut/pie
    }

    // Chart data configuration
    if (this.chartType === 'line' || this.chartType === 'bar') {
      this.chartData = {
        labels: this.labels,
        datasets: [{
          label: this.title,
          data: this.data,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: dark ? '#60a5fa' : '#4f46e5',
          borderWidth: 2,
          fill: this.chartType === 'line',
          pointBackgroundColor: '#ffffff'
        }]
      };
    } else if (this.chartType === 'doughnut' || this.chartType === 'pie') {
      this.chartData = {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.getBackgroundColors(),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }]
      };
    }
  }

  private getBackgroundColors(): string[] {

    const pieColors = [
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
    ];

    const doughnutColors = [
      'rgba(0, 200, 83, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(3, 169, 244, 0.7)',
      'rgba(233, 30, 99, 0.7)', 'rgba(156, 39, 176, 0.7)', 'rgba(255, 87, 34, 0.7)'
    ];

    const baseColors = this.chartType === 'pie' ? pieColors : doughnutColors;

    return this.data.map((_, i) => baseColors[i % baseColors.length]);
  }

}