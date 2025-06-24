import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';

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

  getReferrerIcon(referrer: string): string {
    const key = this.normalizeReferrer(referrer);
    return this.referrerIconMap[key] || this.referrerIconMap['Other'] || 'travel_explore';
  }

  private normalizeReferrer(ref: string): string {
    if (!ref || ref === 'Direct') return 'Direct';

    try {
      const hostname = new URL(ref).hostname;
      if (hostname.includes('google')) return 'Google';
      if (hostname.includes('facebook')) return 'Facebook';
      if (hostname.includes('twitter')) return 'Twitter';
      if (hostname.includes('instagram')) return 'Instagram';
      if (hostname.includes('linkedin')) return 'LinkedIn';
      return 'Other';
    } catch (e) {
      return 'Other';
    }
  }


}
