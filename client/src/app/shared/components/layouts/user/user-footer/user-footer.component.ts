import { Component, effect, inject } from '@angular/core';
import { AdminSettingsEffects } from '../../../../../state/settings/settings.effects';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared.module';
import { AuthStore } from '../../../../../state/auth/auth.store';

@Component({
  selector: 'app-user-footer',
  imports: [RouterModule, SharedModule],
  templateUrl: './user-footer.component.html',
  styleUrl: './user-footer.component.scss'
})
export class UserFooterComponent {
  private authStore = inject(AuthStore);

  currentYear = new Date().getFullYear();
  appName = 'Short Lynkr';

  // public property for template
  isAuth = this.authStore.isAuthenticated;

  constructor(private settingsEffects: AdminSettingsEffects) {
    effect(() => {
      this.appName = this.settingsEffects.appName();
    });
  }

}