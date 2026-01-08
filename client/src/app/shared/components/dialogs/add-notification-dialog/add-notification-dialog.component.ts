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
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100), noWhitespaceValidator]],
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

  getError(controlName: string): string | null {
    const control = this.notificationForm.get(controlName);
    if (!control || !control.errors || !control.touched) return null;

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('whitespace')) {
      return 'Cannot contain only spaces';
    }
    if (control.hasError('leadingOrTrailingSpace')) {
      return 'Remove leading or trailing spaces';
    }
    if (control.hasError('multipleSpaces')) {
      return 'Only one space allowed between words';
    }
    if (control.hasError('minlength')) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    }

    return null;
  }

}