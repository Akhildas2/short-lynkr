import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AdminSettingsEffects } from '../../../../../state/settings/settings.effects';

interface MenuItem {
  icon: string;
  label: string;
  routeLink: string;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [SharedModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  private settingsEffect = inject(AdminSettingsEffects);

  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<void>();

  appName: string = 'Short Lynkr';

  items: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', routeLink: '/admin/dashboard' },
    { icon: 'groups', label: 'Users', routeLink: '/admin/users' },
    { icon: 'link', label: 'Urls', routeLink: '/admin/urls' },
    { icon: 'analytics', label: 'Analytics', routeLink: '/admin/analytics' },
    { icon: 'notifications', label: 'Notifications', routeLink: '/admin/notifications' },
    // { icon: 'security', label: 'Security', routeLink: '/admin/security' }
  ];

  constructor() {
    effect(() => {
      const settings = this.settingsEffect['store'].settings();
      this.appName = settings?.systemSettings?.appName || 'Short Lynkr';
    });
  }

  onLinkClick(): void {
    this.linkClicked.emit();
  }

}