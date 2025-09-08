import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SharedModule } from '../../../shared.module';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';

@Component({
  selector: 'app-analytics-chart',
  imports: [BaseChartDirective, SharedModule, SpinnerComponent],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() chartType: ChartType = 'line';
  @Input() data: number[] | { label: string, data: number[], borderColor?: string, yAxisID?: string }[] = [];
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
    }
  };

  public chartPlugins = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels'] || changes['chartType']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    const dark = this.isDarkMode();

    const tickColor = dark ? '#f9fafb' : '#A9A9A9';
    const gridColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const legendColor = dark ? '#FF9B45' : '#A9A9A9';

    // Chart options
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: legendColor } },
        tooltip: this.chartType === 'pie' || this.chartType === 'doughnut'
          ? {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw as number;
                const dataset = tooltipItem.dataset?.data as number[] || [];
                const total = dataset.reduce((acc, curr) => acc + curr, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${percentage}%`;
              }
            }
          }
          : undefined
      },
      scales: this.chartType === 'line' || this.chartType === 'bar'
        ? {
          x: { ticks: { color: tickColor }, grid: { color: gridColor } },
          y: { type: 'linear', display: true, position: 'left', ticks: { color: tickColor }, grid: { color: gridColor } },
        }
        : undefined
    };

    // --- Line / Bar charts ---
    if (this.chartType === 'line' || this.chartType === 'bar') {
      if (Array.isArray(this.data) && typeof this.data[0] !== 'number') {
        // Multi-dataset
        if (this.chartData.datasets.length !== this.data.length) {
          this.chartData.datasets = (this.data as any[]).map(d => ({
            label: d.label,
            data: d.data,
            borderColor: d.borderColor || '#4f46e5',
            backgroundColor: d.borderColor || '#4f46e5',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: d.yAxisID || 'y'
          }));
        } else {
          (this.data as any[]).forEach((d, i) => {
            this.chartData.datasets[i].data = d.data;
            this.chartData.datasets[i].borderColor = d.borderColor || '#4f46e5';
          });
        }
        this.chartData.labels = this.labels;
      } else {
        // Single dataset
        this.chartData.labels = this.labels;
        if (!this.chartData.datasets[0]) {
          this.chartData.datasets[0] = {
            label: this.title,
            data: this.data as number[],
            borderColor: dark ? '#60a5fa' : '#4f46e5',
            backgroundColor: dark ? '#60a5fa' : '#4f46e5',
            borderWidth: 2,
            fill: this.chartType === 'line',
            pointBackgroundColor: '#ffffff',
            tension: 0.4
          };
        } else {
          this.chartData.datasets[0].data = this.data as number[];
          this.chartData.datasets[0].borderColor = dark ? '#60a5fa' : '#4f46e5';
          this.chartData.datasets[0].backgroundColor = dark ? '#60a5fa' : '#4f46e5';
        }
      }
    }

    // --- Pie / Doughnut charts ---
    if (this.chartType === 'doughnut' || this.chartType === 'pie') {
      this.chartData = {
        labels: this.labels,
        datasets: [{
          data: this.data as number[],
          backgroundColor: this.getBackgroundColors(),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }]
      };
    }

    // Update chart smoothly
    this.chart?.update();
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