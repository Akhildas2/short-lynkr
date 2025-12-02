import { Component, Inject } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notification, NotificationCategory, NotificationType } from '../../../../models/notification/notification.interface';
import { noWhitespaceValidator } from '../../../utils/noWhitespaceValidator';

@Component({
  selector: 'app-add-notification-dialog',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './add-notification-dialog.component.html',
  styleUrl: './add-notification-dialog.component.scss'
})
export class AddNotificationDialogComponent {
  notificationForm: FormGroup;

  categories: NotificationCategory[] = [
    NotificationCategory.User,
    NotificationCategory.Url,
    NotificationCategory.Qr,
    NotificationCategory.System,
    NotificationCategory.Settings
  ];

  types: NotificationType[] = [
    NotificationType.Info,
    NotificationType.Success,
    NotificationType.Warning,
    NotificationType.Error
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.notificationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator]],
      message: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), noWhitespaceValidator]],
      type: [NotificationType.Info, Validators.required],
      category: [NotificationCategory.User, Validators.required],
      sendTo: ['all', Validators.required],
      userId: [null],
      forAdmin: [false],
    });
  }

  onSubmit(): void {
    if (this.notificationForm.valid) {
      const formValue = this.notificationForm.value;

      const newNotification: Notification = {
        title: formValue.title,
        message: formValue.message,
        type: formValue.type,
        category: formValue.category,
        forAdmin: formValue.forAdmin
      };

      this.dialogRef.close(newNotification);
    }
  }
}