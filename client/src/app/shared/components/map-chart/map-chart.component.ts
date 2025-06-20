import { ChangeDetectionStrategy, Component, Input, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import { BaseChartDirective } from 'ng2-charts';
import type { FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { SharedModule } from '../../shared.module';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';
import { SpinnerComponent } from '../spinner/spinner.component';

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale, ProjectionScale);
countries.registerLocale(enLocale);

@Component({
  selector: 'app-map-chart',
  imports: [BaseChartDirective, SharedModule,SpinnerComponent],
  templateUrl: './map-chart.component.html',
  styleUrl: './map-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapChartComponent implements OnChanges {
  @Input() data: { countryCode: string, value: number }[] = [];
  @Input() loading: boolean = false;
  // Timeout to debounce map rendering
  private renderTimeout: any;

  constructor(private snackbarService: SnackbarService, private ngZone: NgZone) { }
  // Define the chart type as 'choropleth'
  public chartType: 'choropleth' = 'choropleth';

  public chartData: ChartData<'choropleth'> = {
    labels: [],
    datasets: []
  };

  // Chart options to configure the map's appearance and behavior
  public chartOptions: ChartOptions<'choropleth'> = {
    responsive: true,// Make the chart responsive
    maintainAspectRatio: false,// Do not maintain aspect ratio, fill container
    showOutline: false,// Show country outlines
    showGraticule: false,// Do not show latitude/longitude lines
    animation: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const feature = (tooltipItems[0].raw as any)?.feature;
            return feature?.properties?.name || 'Unknown';
          },
          label: (ctx) => {
            const label = ctx.chart.data.labels?.[ctx.dataIndex] || '';
            const value = (ctx.raw as any)?.value || 0;
            return `${label}: ${value} clicks`;
          }
        }
      }
    },
    scales: {
      projection: {
        axis: 'x',
        projection: 'equalEarth'
      },
      color: {
        axis: 'x',
        quantize: 5,
        legend: {
          position: 'top-right',
          align: 'right'
        }
      }
    }
  };

  // Lifecycle hook for changes
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data?.length > 0) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = setTimeout(() => {
        this.ngZone.run(() => this.loadMap());
      }, 300);
    }
  }


  private async loadMap() {
    try {
      const res = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
      const world: Topology = await res.json();
      const geojson = feature(
        world as any,
        (world as any).objects.countries
      ) as unknown as FeatureCollection<Geometry>;

      // Calculate isDarkMode
      const isDarkMode = document.documentElement.classList.contains('dark');

      const countryDataMap = new Map(
        this.data.map(d => [d.countryCode.toUpperCase(), d.value])
      );

      const chartDataPoints = geojson.features.map((feat: any) => {
        const numericCode = feat.id;
        const iso2 = numericCode ? countries.numericToAlpha2(parseInt(numericCode, 10)) : undefined;
        const value = iso2 ? (countryDataMap.get(iso2.toUpperCase()) || 0) : 0;

        return {
          feature: {
            ...feat,
            properties: { ...feat.properties, iso_a2: iso2, name: feat.properties.name || (typeof iso2 === 'string' ? countries.getName(iso2, 'en') : undefined) }
          }, value
        };
      });

      this.ngZone.run(() => {
        const maxValue = Math.max(...chartDataPoints.map(d => d.value));

        this.chartData = {
          labels: chartDataPoints.map(dp => dp.feature.properties.name || 'Unknown'),
          datasets: [{
            label: 'Clicks by Country',
            data: chartDataPoints,
            backgroundColor: (ctx: any) => {
              const raw = ctx.raw as any;
              const value = raw?.value ?? 0;

              if (!value) {
                return isDarkMode ? 'rgba(55,65,81,0.3)' : 'rgba(243,244,246,0.8)';
              }

              // Use the pre-calculated maxValue
              const intensity = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;

              return isDarkMode
                ? `rgba(96,165,250,${0.4 + intensity * 0.6})`
                : `rgba(59,130,246,${0.4 + intensity * 0.6})`;
            },
            borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(156,163,175,0.8)',
            borderWidth: 0.5,
          }]
        };
      });

    } catch (err) {
      console.error(err);
      this.snackbarService.showError('Failed to load map data');
    }
  }

}