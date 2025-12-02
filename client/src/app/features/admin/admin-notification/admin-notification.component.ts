import { Component, signal, WritableSignal } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { BaseNotificationComponent } from '../../../shared/base/base-notification.component';
import { NotificationDialogComponent } from '../../../shared/components/dialogs/notification-dialog/notification-dialog.component';
import { Notification } from '../../../models/notification/notification.interface';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message/error-message.component';

@Component({
  selector: 'app-admin-notification',
  imports: [SharedModule, SpinnerComponent, ScrollButtonsComponent, ErrorMessageComponent],
  templateUrl: './admin-notification.component.html',
  styleUrl: './admin-notification.component.scss'
})
export class AdminNotificationComponent extends BaseNotificationComponent {
  pageTitle = 'Notifications';
  // Use WritableSignal for something you want to update
  override isLoading: WritableSignal<boolean> = signal(true);

  override ngOnInit(): void {
    super.ngOnInit();

    // Hide spinner after 2 seconds
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  openAndMark(adminNotification: Notification) {
    this.markAsRead(adminNotification, NotificationDialogComponent);
  }

  reloadNotifications(): void {
    this.notificationEffects.loadNotifications();
  }

}