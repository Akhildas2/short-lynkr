import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';
import { AuthEffects } from '../../../../../state/auth/auth.effects';
import { AdminSettingsEffects } from '../../../../../state/settings/settings.effects';
import { BaseNotificationComponent } from '../../../../base/base-notification.component';
import { NotificationMenuComponent } from '../../../ui/notification-menu/notification-menu.component';

@Component({
  selector: 'app-user-header',
  imports: [SharedModule, RouterLink, ThemeToggleComponent, NotificationMenuComponent],
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.scss'
})
export class UserHeaderComponent extends BaseNotificationComponent implements OnInit, OnDestroy {
  private authEffects = inject(AuthEffects);
  private settingsEffect = inject(AdminSettingsEffects);

  mobileMenuOpen: boolean = false;
  mobileDropdownOpen: boolean = false;
  isMobile: boolean = false;
  showNotificationsMenu = false;

  appName: string = 'Short Lynkr';
  menuItems = [
    { label: 'Home', link: '/' },
    { label: 'QR Generator', link: '/qr-generator' },
    { label: 'Features', link: '/features' }
  ];

  guestMenuItems = [
    { label: 'Sign In', link: '/auth/sign-in' },
    { label: 'Sign Up', link: '/auth/sign-up' }
  ];

  constructor() {
    super();

    this.authEffects.checkAuthStatus();

    effect(() => {
      const isAuth = this.authStore.isAuthenticated();
      if (isAuth) {
        this.notificationEffects.loadNotifications();
      }

      // Also update app name
      const settings = this.settingsEffect['store'].settings();
      this.appName = settings?.systemSettings?.appName || 'Short Lynkr';
    });

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

  override ngOnInit(): void {
    super.ngOnInit();

    window.addEventListener('resize', this.updateScreenSize);
    this.updateScreenSize();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
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