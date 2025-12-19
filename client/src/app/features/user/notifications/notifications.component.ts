import { Component, Signal } from '@angular/core';
import { BaseNotificationComponent } from '../../../shared/base/base-notification.component';
import { NotificationDialogComponent } from '../../../shared/components/dialogs/notification-dialog/notification-dialog.component';
import { Notification } from '../../../models/notification/notification.interface';
import { SharedModule } from '../../../shared/shared.module';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-notifications',
  imports: [SharedModule, SpinnerComponent, EmptyStateComponent],
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