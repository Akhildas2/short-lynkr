import { Component, computed, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AuthEffects } from '../../../../../state/auth/auth.effects';
import { BaseNotificationComponent } from '../../../../base/base-notification.component';
import { NotificationMenuComponent } from '../../../ui/notification-menu/notification-menu.component';

@Component({
  selector: 'app-admin-header',
  imports: [SharedModule, ThemeToggleComponent, ReactiveFormsModule, RouterModule, NotificationMenuComponent],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent extends BaseNotificationComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarState: 0 | 1 | 2 = 1;
  @Input() collapsed = false;
  @Input() isMobile = false;

  showProfileMenu = false;
  showNotificationsMenu = false;
  showMobileSearch = false;
  isSmallDevice = false;

  adminMenu = [
    { label: 'Profile', icon: 'person', link: '/admin/settings' },
    { label: 'Notifications', icon: 'notifications', link: '/admin/notifications' },
    { label: 'Settings', icon: 'settings', link: '/admin/settings' },
  ];

  readonly admin = this.authStore.user;
  readonly role = this.authStore.userRole;
  readonly isAdmin = computed(() => this.role() === 'admin');

  searchControl = new FormControl(''); // FormControl for the search input

  constructor(private authEffects: AuthEffects) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.checkScreenSize();

    // Subscribe to search term changes from the service to pre-fill the input if navigated back
    this.globalSearchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        // Only update if the control's current value is different to avoid infinite loops
        if (this.searchControl.value !== term) {
          this.searchControl.setValue(term, { emitEvent: false }); // Do not emit event to avoid re-triggering
        }
      });

    // Listen for changes in the search input and push to the global service
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.globalSearchService.setSearchTerm(term || '');
      });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  toggleNotifications(): void {
    this.showNotificationsMenu = !this.showNotificationsMenu;
  }

  private checkScreenSize() {
    this.isSmallDevice = window.innerWidth <= 430;
  }

  toggleProfileMenu(): boolean {
    return this.showProfileMenu = !this.showProfileMenu
  }

  toggleMobileSearch(): boolean {
    this.showMobileSearch = !this.showMobileSearch;
    if (!this.showMobileSearch) {
      this.clearSearch();
    }
    return this.showMobileSearch;
  }

  get toggleIcon(): string {
    if (this.isMobile) {
      return this.sidebarState === 0 ? 'menu' : 'close';
    }
    return ['menu', 'chevron_right', 'close'][this.sidebarState] || 'menu';
  }

  override clearSearch(): void {
    this.searchControl.setValue('');
    this.globalSearchService.clearSearchTerm();
  }

  logout(): void {
    this.authEffects.logout();
  }

}