import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../Material.Module';

@Component({
  selector: 'app-statistics',
  imports: [HeaderComponent,FooterComponent,CommonModule,MaterialModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
   displayedColumns: string[] = ['timestamp', 'location', 'device', 'referrer'];
  recentActivity = [
    {
      timestamp: new Date(),
      location: 'New York, US',
      device: 'iPhone',
      deviceIcon: 'phone_iphone',
      referrer: 'Instagram'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      location: 'London, UK',
      device: 'Chrome Desktop',
      deviceIcon: 'desktop_windows',
      referrer: 'Google Search'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      location: 'Berlin, DE',
      device: 'Android Phone',
      deviceIcon: 'android',
      referrer: 'Twitter'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      location: 'Tokyo, JP',
      device: 'Safari Desktop',
      deviceIcon: 'desktop_mac',
      referrer: 'Direct'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      location: 'Sydney, AU',
      device: 'iPad',
      deviceIcon: 'tablet_mac',
      referrer: 'Email'
    }
  ];
}
