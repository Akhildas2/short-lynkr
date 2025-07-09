import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-admin-header',
  imports: [SharedModule, ThemeToggleComponent],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarState: 0 | 1 | 2 = 1;
  @Input() collapsed = false;
  @Input() isMobile = false;
  showProfileMenu = false;
  showMobileSearch = false;
  isSmallDevice = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isSmallDevice = window.innerWidth <= 430;
  }

  toggleProfileMenu(): boolean {
    return this.showProfileMenu = !this.showProfileMenu
  }

  toggleMobileSearch(): boolean {
    return this.showMobileSearch = !this.showMobileSearch
  }

  get toggleIcon(): string {
    if (this.isMobile) {
      return this.sidebarState === 0 ? 'menu' : 'close';
    }
    return ['menu', 'chevron_right', 'close'][this.sidebarState];
  }

}