import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-admin-header',
  imports: [SharedModule, ThemeToggleComponent],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarState: 0 | 1 | 2 = 1;
  @Input() collapsed = false;
  @Input() isMobile = false;
  showProfileMenu = false;
  hideSearch = true;

  toggleProfileMenu(): boolean {
    return this.showProfileMenu = !this.showProfileMenu
  }

  toggleSearch(): boolean {
    return this.hideSearch = !this.hideSearch
  }

  get toggleIcon(): string {
    if (this.isMobile) {
      return this.sidebarState === 0 ? 'menu' : 'close';
    }
    return ['menu', 'chevron_right', 'close'][this.sidebarState];
  }

}
