import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import { BaseChartDirective } from 'ng2-charts';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { SharedModule } from '../../shared.module';

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

@Component({
  selector: 'app-map-chart',
  imports: [BaseChartDirective, SharedModule],
  templateUrl: './map-chart.component.html',
  styleUrl: './map-chart.component.scss'
})
export class MapChartComponent implements OnChanges {
  @Input() data: { countryCode: string, value: number }[] = [];

  public chartType: ChartType = 'choropleth';

  public chartData: ChartData<'choropleth'> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartOptions<'choropleth'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
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
        display: false
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
      // Fetch the TopoJSON
      const res = await fetch('https://unpkg.com/world-atlas/countries-110m.json');

      if (!res.ok) {
        throw new Error(`Failed to fetch world atlas: ${res.status}`);
      }

      const world = await res.json();

      // Convert TopoJSON to GeoJSON
      const geojson = feature(
        world as any,
        (world as any).objects.countries
      ) as unknown as FeatureCollection;

      const countries = geojson.features;

      const countryDataMap = new Map(
        this.data.map(d => [d.countryCode.toLowerCase(), d.value])
      );

      this.chartData = {
        labels: countries.map(f => f.properties?.['name'] || 'Unknown'),
        datasets: [{
          label: 'Country Data',
          data: countries.map(f => ({
            feature: f,
            value: countryDataMap.get(String(f.properties?.['iso_a2'] || f.properties?.['iso_a3'] || f.properties?.['name']).toLowerCase()) ?? 0
          })),
          backgroundColor: (ctx) => {
            const value = (ctx.raw as any)?.value || 0;
            if (value === 0) return 'rgba(200, 200, 200, 0.3)';
            const max = Math.max(...this.data.map(d => d.value));
            const opacity = Math.min(value / max, 1);
            return `rgba(79, 70, 229, ${0.3 + opacity * 0.7})`;
          },
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 0.5
        }]
      };

    } catch (error) {
      console.error('Error loading map data:', error);
    }
  }
}