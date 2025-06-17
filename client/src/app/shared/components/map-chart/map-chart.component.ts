import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import { BaseChartDirective } from 'ng2-charts';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { SharedModule } from '../../shared.module';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale, ProjectionScale);
countries.registerLocale(enLocale);

@Component({
  selector: 'app-map-chart',
  imports: [BaseChartDirective, SharedModule],
  templateUrl: './map-chart.component.html',
  styleUrl: './map-chart.component.scss'
})
export class MapChartComponent implements OnChanges {
  @Input() data: { countryCode: string, value: number }[] = [];

  constructor(private snackbarService: SnackbarService) { }

  public chartType: 'choropleth' = 'choropleth';

  public chartData: ChartData<'choropleth'> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartOptions<'choropleth'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0]?.label || '';
          },
          label: (ctx) => {
            const label = ctx.chart.data.labels?.[ctx.dataIndex] || '';
            const value = (ctx.raw as any)?.value || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      xy: {
        projection: 'equalEarth'
      },
      color: {
        display: true,
        position: 'bottom',
        quantize: 5,
        interpolate: 'blues'
      }
    }
  };

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data?.length > 0) {
      await this.loadMap();
    }
  }

  private async loadMap() {
    try {
      const res = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-50m.json'); // better resolution & consistent with official

      if (!res.ok) {
        this.snackbarService.showError(`Failed to fetch world atlas: ${res.status}`);
        return;
      }

      const world = await res.json();

      // Convert TopoJSON to GeoJSON
      const geojson = feature(
        world as any,
        (world as any).objects.countries
      ) as unknown as FeatureCollection;

      const countriesList = geojson.features as any[];

      // Create mapping from numeric ID to country properties
      const idToCountryInfo = new Map<number, { alpha3: string; name: string }>();
      (world as any).objects.countries.geometries.forEach((g: any) => {
        const alpha3 = g.properties?.iso_a3;
        const alpha2 = alpha3 ? countries.alpha3ToAlpha2(alpha3) : null;
        const name = alpha2 ? countries.getName(alpha2, 'en') : g.properties?.name || 'Unknown';

        idToCountryInfo.set(g.id, {
          alpha3: alpha3 || '',
          name: name || 'Unknown'
        });
      });

      // Create a map for quick lookup of data values
      const countryDataMap = new Map<string, number>();
      this.data.forEach(d => {
        // Handle both ISO2 and ISO3 codes
        const upperCode = d.countryCode.toUpperCase();
        countryDataMap.set(upperCode, d.value);

        // Also try to convert and store alternate formats
        if (upperCode.length === 2) {
          const alpha3 = countries.alpha2ToAlpha3(upperCode);
          if (alpha3) countryDataMap.set(alpha3, d.value);
        } else if (upperCode.length === 3) {
          const alpha2 = countries.alpha3ToAlpha2(upperCode);
          if (alpha2) countryDataMap.set(alpha2, d.value);
        }
      });

      const values = this.data.map(d => d.value);
      const maxValue = Math.max(...values, 1);
      const minValue = Math.min(...values, 0);

      // Prepare chart data
      const chartLabels: string[] = [];
      const chartDataPoints: any[] = [];

      countriesList.forEach((feature: any) => {
        const countryInfo = idToCountryInfo.get(feature.id);
        const countryName = countryInfo?.name || 'Unknown';
        const alpha3 = countryInfo?.alpha3;
        const alpha2 = alpha3 ? countries.alpha3ToAlpha2(alpha3) : null;

        // Try to find value using different country code formats
        let value = 0;
        if (alpha2) {
          value = countryDataMap.get(alpha2.toUpperCase()) || 0;
        }
        if (value === 0 && alpha3) {
          value = countryDataMap.get(alpha3.toUpperCase()) || 0;
        }

        chartLabels.push(countryName);
        chartDataPoints.push({
          feature: feature,
          value: value
        });
      });

      this.chartData = {
        labels: chartLabels,
        datasets: [{
          label: 'Country Data',
          outline: geojson.features,
          showOutline: true,
          data: chartDataPoints,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 0.5,
        }]
      };

      // Update chart options with proper scale configuration
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        showOutline: true,
        showGraticule: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => tooltipItems[0]?.label || '',
              label: (ctx) => {
                const label = ctx.chart.data.labels?.[ctx.dataIndex] || '';
                const value = (ctx.raw as any)?.value || 0;
                return `${label}: ${value}`;
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
            display: true,
            position: 'bottom',
            quantize: 5,
            interpolate: 'blues',
            min: minValue,
            max: maxValue
          } as any
        }
      };


    } catch (error) {
      console.error('Error loading map data:', error);
      this.snackbarService.showError('Failed to load map data');
    }
  }

}