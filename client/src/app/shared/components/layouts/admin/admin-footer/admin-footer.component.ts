import { Component, effect, inject } from '@angular/core';
import { AdminSettingsEffects } from '../../../../../state/settings/settings.effects';
import { SharedModule } from '../../../../shared.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-footer',
  imports: [SharedModule, RouterLink],
  templateUrl: './admin-footer.component.html',
  styleUrl: './admin-footer.component.scss'
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
  appName = 'Short Lynkr';

  constructor(private settingsEffects: AdminSettingsEffects) {
    effect(() => {
      this.appName = this.settingsEffects.appName();
    });
  }

}