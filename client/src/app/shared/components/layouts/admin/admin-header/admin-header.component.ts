import { Component, computed, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GlobalSearchService } from '../../../../services/global-search/global-search.service';
import { Router, RouterModule } from '@angular/router';
import { AuthEffects } from '../../../../../state/auth/auth.effects';
import { AuthStore } from '../../../../../state/auth/auth.store';
import { NotificationService } from '../../../../../core/services/api/notification/notification.service';
import { Notification } from '../../../../../models/notification/notification.interface';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../../../dialogs/notification-dialog/notification-dialog.component';
import { AlertDialogComponent } from '../../../dialogs/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-admin-header',
  imports: [SharedModule, ThemeToggleComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  private authStore = inject(AuthStore);
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarState: 0 | 1 | 2 = 1;
  @Input() collapsed = false;
  @Input() isMobile = false;

  showProfileMenu = false;
  showNotificationsMenu = false;
  showMobileSearch = false;
  isSmallDevice = false;

  readonly admin = this.authStore.user;
  readonly role = this.authStore.userRole;
  readonly isAdmin = computed(() => this.role() === 'admin');

  searchControl = new FormControl(''); // FormControl for the search input
  notifications: Notification[] = [];
  unreadCount = 0;
  private destroy$ = new Subject<void>(); // Subject to manage subscriptions

  constructor(private globalSearchService: GlobalSearchService, private authEffects: AuthEffects, private notificationService: NotificationService, private router: Router, private dialog: MatDialog) { }
  ngOnInit(): void {
    this.checkScreenSize();
    this.loadNotifications();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data.slice(0, 5); // Show only latest 5
      this.unreadCount = data.filter(n => !n.read).length;
    });
  }

  toggleNotifications(): void {
    this.showNotificationsMenu = !this.showNotificationsMenu;
  }

  markAsRead(notification: Notification): void {
    if (!notification.read && notification._id) {
      this.notificationService.markAsRead(notification._id).subscribe(() => this.loadNotifications());
    }

    const dialogRef = this.dialog.open(NotificationDialogComponent, {
      width: '500px',
      data: notification,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.deleted && result.id) {
        // Show confirmation before deleting
        const confirmDialog = this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Delete Notification?',
            content: `Are you sure you want to delete this notification: "${notification.title}"? This action cannot be undone.`,
            actionText: 'Delete',
            actionIcon: 'delete',
            confirmOnly: true
          },
        });

        confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.notificationService.deleteNotification(result.id)
              .subscribe(() => this.loadNotifications());
          }
        });
      }
    });
  }

  viewAll(): void {
    this.router.navigate(['/admin/notifications']); // Navigate to full notifications page
  }

  toggleAllReadUnread(): void {
    if (!this.notifications.length) return;

    // Determine new state: mark read if there are unread, else mark unread
    const markAsRead = this.notifications.some(n => !n.read);

    const ids = this.notifications.map(n => n._id!);

    this.notificationService.toggleReadStatus(ids, markAsRead)
      .subscribe(() => {
        this.notifications = this.notifications.map(n => ({ ...n, read: markAsRead }));
        this.unreadCount = markAsRead ? 0 : this.notifications.length;
      });
  }


  deleteNotification(id: string, notificationTitle: string) {

    const dialog = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Delete Notification?',
        content: `Are you sure you want to delete this notification: "${notificationTitle}"? This action cannot be undone.`,
        actionText: 'Delete',
        actionIcon: 'delete',
        confirmOnly: true
      },
    });

    dialog.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.notificationService.deleteNotification(id)
          .subscribe(() => this.loadNotifications());
      }
    });
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

  clearSearch(): void {
    this.searchControl.setValue('');
    this.globalSearchService.clearSearchTerm();
  }

  logout(): void {
    this.authEffects.logout();
  }

}