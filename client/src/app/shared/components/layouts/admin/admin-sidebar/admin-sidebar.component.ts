import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  routeLink: string;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [SharedModule, RouterLink, RouterLinkActive,RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<void>();

  items: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', routeLink: '/admin/dashboard' },
    { icon: 'link', label: 'Urls', routeLink: '/admin/urls' },
    { icon: 'analytics', label: 'Analytics', routeLink: '/admin/analytics' },
    { icon: 'people', label: 'Users', routeLink: '/admin/users' },
    //{ icon: 'folder', label: 'Categories', routeLink: '/admin/categories' },
    // { icon: 'security', label: 'Security', routeLink: '/admin/security' }
  ];

  onLinkClick(): void {
    this.linkClicked.emit();
  }

}