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
  @Input() collapsed = false;
  showProfileMenu = false;
  hideSearch = true;

  toggleProfileMenu(): boolean {
    return this.showProfileMenu = !this.showProfileMenu
  }

  toggleSearch(): boolean {
    return this.hideSearch = !this.hideSearch
  }

}
