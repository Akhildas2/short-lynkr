import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';
import { AuthEffects } from '../../../../../state/auth/auth.effects';
import { AuthStore } from '../../../../../state/auth/auth.store';
import { AdminSettingsEffects } from '../../../../../state/settings/settings.effects';

@Component({
  selector: 'app-user-header',
  imports: [SharedModule, RouterLink, ThemeToggleComponent],
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.scss'
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  private authEffects = inject(AuthEffects);
  private authStore = inject(AuthStore);
  private settingsEffect = inject(AdminSettingsEffects);

  mobileMenuOpen: boolean = false;
  mobileDropdownOpen: boolean = false;
  isMobile: boolean = false;

  appName: string = 'Short Lynkr';

  constructor() {
    this.authEffects.checkAuthStatus();
    effect(() => {
      const settings = this.settingsEffect['store'].settings();
      this.appName = settings?.systemSettings?.appName || 'Short Lynkr';
    })
  }

  get user(): boolean {
    return this.authStore.isAuthenticated();
  }

  get username(): string {
    return this.authStore.username();
  }

  logout(): void {
    this.authEffects.logout();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.updateScreenSize);
    this.updateScreenSize();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateScreenSize)
  }

  private updateScreenSize = () => {
    this.isMobile = window.innerWidth < 480;
  }

  toggleMobileDropdown() {
    if (this.isMobile) {
      this.mobileDropdownOpen = !this.mobileDropdownOpen
    }
  }

}