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
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<void>();

  appName: string = 'Short Lynkr';

  items: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', routeLink: '/admin/dashboard' },
    { icon: 'groups', label: 'Users List', routeLink: '/admin/users' },
    { icon: 'link', label: 'Urls List', routeLink: '/admin/urls' },
    { icon: 'qr_code_2', label: 'Qrs List', routeLink: '/admin/qrs' },
    { icon: 'analytics', label: 'Analytics', routeLink: '/admin/analytics' },
    { icon: 'question_answer', label: 'Inquiries', routeLink: '/admin/inquiries' },
    { icon: 'notifications', label: 'Notifications', routeLink: '/admin/notifications' },
  ];

  constructor(private settingsEffects: AdminSettingsEffects) {
    effect(() => {
      this.appName = this.settingsEffects.appName();
    });
  }

  onLinkClick(): void {
    this.linkClicked.emit();
  }

}