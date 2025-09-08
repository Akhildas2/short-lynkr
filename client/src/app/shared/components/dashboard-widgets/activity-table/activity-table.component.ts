import { Component, inject, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { LocationService } from '../../../utils/location.service';

@Component({
  selector: 'app-activity-table',
  imports: [SharedModule],
  templateUrl: './activity-table.component.html',
  styleUrl: './activity-table.component.scss'
})
export class ActivityTableComponent {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() deviceIconMap: Record<string, string> = {};
  @Input() referrerIconMap: Record<string, string> = {};
  @Input() referrerIconMapFallbackIcon: string = '';
  @Input() deviceIconMapFallbackIcon: string = '';
  @Input() iconMap: Record<string, string> = {};
  @Input() fallbackIcon: string = '';
  
  private locationService = inject(LocationService);

  getReferrerKey(referrer: string): string {
    if (!referrer) return 'Other';

    if (referrer.toLowerCase() === 'direct') return 'Direct';

    try {
      const url = new URL(referrer);
      const host = url.hostname.toLowerCase();

      if (host.includes('google')) return 'Google';
      if (host.includes('facebook')) return 'Facebook';
      if (host.includes('instagram')) return 'Instagram';
      if (host.includes('linkedin')) return 'LinkedIn';
      if (host.includes('twitter') || host.includes('x.com')) return 'Twitter';
      if (host.includes('youtube')) return 'YouTube';

      return 'Other';
    } catch {
      return referrer;
    }
  }

  getCountryName(code: string): string {
    if (!code) return 'Unknown';
    return this.locationService.getCountryName(code.toUpperCase());
  }

  capitalize(str: string | undefined): string {
    if (!str) return '';
    str = str.toLowerCase();
    return str[0].toUpperCase() + str.slice(1);
  }

}