import { Component, inject, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { LocationService } from '../../../utils/location.service';
import { NoDataComponent } from '../../ui/no-data/no-data.component';

@Component({
  selector: 'app-stats-list',
  imports: [SharedModule, NoDataComponent],
  templateUrl: './stats-list.component.html',
  styleUrl: './stats-list.component.scss'
})
export class StatsListComponent {
  @Input() title = '';
  @Input() items: { name: string; value?: number; percentage: number; subtitle?: string }[] = [];
  @Input() iconMap: Record<string, string> = {};
  @Input() fallbackIcon: string = '';
  @Input() showProgressBar = true;
  @Input() noDataIcon: string = 'info';
  @Input() noDataVariant: 'card' | 'overlay' = 'overlay';
  @Input() noDataTitle: string = 'No data available';
  @Input() noDataDescription: string = 'Nothing to show right now.';

  private locationService = inject(LocationService);

  private formatName(str: string | undefined): string {
    if (!str) return 'Unknown';
    str = str.toLowerCase();
    return str[0].toUpperCase() + str.slice(1);
  }

  getFullName(item: { name: string; value?: number; percentage: number }): string {
    if (this.title.includes('Top Countries')) {
      return this.formatName(
        this.locationService.getCountryName(item.name?.toUpperCase())
      );
    } else if (this.title.includes('Top Regions')) {
      const [countryCode, regionCode] = item.name.split('|');
      return this.formatName(
        this.locationService.getRegionName(
          countryCode?.toUpperCase(),
          regionCode?.toUpperCase()
        )
      );
    }
    return this.formatName(item.name);
  }


}