import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';

@Component({
  selector: 'app-admin-settings',
  imports: [SharedModule, PageHeaderComponent],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent {
 timeRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'All Time'];
  settings = {
    name: 'Admin',
    email: 'admin@example.com',
    twoFA: false,
    darkMode: false,
    defaultRange: 'Last 7 Days',
    emailNotifications: true,
    activityAlerts: true
  };

  saveSettings() {
    console.log('Settings saved:', this.settings);
    // Call backend API to persist changes
  }
}