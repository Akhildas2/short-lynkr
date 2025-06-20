import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SharedModule } from '../../shared.module';
import { SpinnerComponent } from '../spinner/spinner.component';


@Component({
  selector: 'app-analytics-chart',
  imports: [BaseChartDirective, SharedModule,SpinnerComponent],
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
    this.chartData = {
      labels: this.labels,
      datasets: [{
        label: this.title,
        data: this.data,
        backgroundColor: this.getBackgroundColors(),
        borderColor: dark ? '#60a5fa' : '#4f46e5',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        fill: this.chartType === 'line'
      }]
    };

    const tickColor = dark ? '#f9fafb' : '#A9A9A9';
    const gridColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)';
    const titleColor = dark ? '#f9fafb' : '#A9A9A9';
    const legendColor = dark ? '#f9fafb' : '#A9A9A9';

    this.chartOptions.scales = {
      x: {
        ticks: {
          color: tickColor
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        ticks: {
          color: tickColor
        },
        grid: {
          color: gridColor
        }
      }
    };

    if (this.chartOptions.plugins?.title) {
      this.chartOptions.plugins.title.text = this.title;
      this.chartOptions.plugins.title.color = titleColor;
    }

    if (this.chartOptions.plugins?.legend) {
      this.chartOptions.plugins.legend.labels = {
        color: legendColor
      };
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