import { Component } from '@angular/core';
import { BaseNotificationComponent } from '../../../shared/base/base-notification.component';
import { NotificationDialogComponent } from '../../../shared/components/dialogs/notification-dialog/notification-dialog.component';
import { Notification } from '../../../models/notification/notification.interface';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-notifications',
  imports: [SharedModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent extends BaseNotificationComponent {
  pageTitle = 'Notifications';

  override ngOnInit(): void {
    super.ngOnInit();
  }

  openAndMark(userNotification: Notification) {
    this.markAsRead(userNotification, NotificationDialogComponent);
  }

}