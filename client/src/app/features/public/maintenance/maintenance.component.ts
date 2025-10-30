import { Component, effect, inject, OnInit } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { SharedModule } from '../../../shared/shared.module';
import { fadeInAnimation, fadeInLeftAnimation, slideInUpAnimation, staggerAnimation, zoomInAnimation } from '../../../shared/utils/animations.util';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  imports: [UserHeaderComponent, UserFooterComponent, SharedModule, SpinnerComponent],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss',
  animations: [zoomInAnimation, fadeInAnimation, fadeInLeftAnimation, slideInUpAnimation, staggerAnimation]
})
export class MaintenanceComponent implements OnInit {
  supportEmail: string = 'support@example.com';
  appName: string = 'Short Lynkr';
  isLoading: boolean = false;
  maintenanceStart: Date | null = null;
  maintenanceEnd: Date | null = null;


  private settingsEffect = inject(AdminSettingsEffects);

  constructor(private router: Router) {
    // Settings updates 
    effect(() => {
      const settings = this.settingsEffect['store'].settings()?.systemSettings;
      if (settings) {
        this.appName = settings.appName;
        this.supportEmail = settings.supportEmail;
        this.maintenanceStart = settings.maintenanceStart ? new Date(settings.maintenanceStart) : null;
        this.maintenanceEnd = settings.maintenanceEnd ? new Date(settings.maintenanceEnd) : null;
      }

    });
  }

  ngOnInit(): void {
    this.settingsEffect.loadSettings();
  }

  /** Refresh the page */
  refresh(): void {
    this.isLoading = true;
    // Navigate to home page
    this.router.navigate(['/']).finally(() => {
      this.isLoading = false;
    });
  }


}