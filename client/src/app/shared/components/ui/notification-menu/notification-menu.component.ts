import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseNotificationComponent } from '../../../base/base-notification.component';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared.module';
import { Notification } from '../../../../models/notification/notification.interface';

@Component({
  selector: 'app-notification-menu',
  imports: [SharedModule],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.scss'
})
export class NotificationMenuComponent extends BaseNotificationComponent {
  @Input() role: 'admin' | 'user' = 'user';
  @Output() menuClosed = new EventEmitter<void>();

  constructor(private router: Router) {
    super();
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuClosed.emit();
  }

  viewAll(): void {
    this.router.navigate([
      this.role === 'admin' ? '/admin/notifications' : '/user/notifications'
    ]);

    this.menuClosed.emit();
  }

  onNotificationClick(n: Notification) {
    this.markAsRead(n);
  }

  closeMenu(): void {
    this.menuClosed.emit(); // emit event to parent to hide menu
  }

}