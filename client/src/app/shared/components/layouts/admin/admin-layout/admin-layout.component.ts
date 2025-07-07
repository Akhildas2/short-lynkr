import { Component, HostListener, OnInit } from '@angular/core';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../../../shared.module';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

type SidebarState = 0 | 1 | 2;

@Component({
  selector: 'app-admin-layout',
  imports: [AdminHeaderComponent, AdminFooterComponent, RouterOutlet, SharedModule, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  sidebarState: SidebarState = 1;
  isMobile = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 770;
    // Force to 0 or 2 if mobile
    if (this.isMobile && this.sidebarState === 1) {
      this.sidebarState = 0;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      // Only toggle between 0 and 2 on mobile
      this.sidebarState = this.sidebarState === 2 ? 0 : 2;
    } else {
      // Cycle 0 → 1 → 2 → 0 on desktop
      this.sidebarState = (this.sidebarState + 1) % 3 as SidebarState;
    }
  }


  closeSidebar(): void {
    if (this.isMobile && this.sidebarState === 2) {
      this.sidebarState = 0;
    }
  }

  onSidebarLinkClicked(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  onSidenavClosed(): void {
    if (this.isMobile && this.sidebarState === 2) {
      this.sidebarState = 0;
    }
  }

}