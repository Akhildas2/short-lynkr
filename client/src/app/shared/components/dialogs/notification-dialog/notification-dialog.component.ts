import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared.module';
import { NotificationCategory, NotificationType } from '../../../../models/notification/notification.interface';
import { getCategoryBadgeClass, getCategoryIcon, getIconClass, getIconName } from '../../../utils/notification.utils';

@Component({
  selector: 'app-notification-dialog',
  imports: [SharedModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent {
  @Output() deleteConfirmed = new EventEmitter<string>();

  /** Helpers to use in template */
  getIconName = getIconName;
  getIconClass = getIconClass;
  getCategoryIcon = getCategoryIcon;
  getCategoryBadgeClass = getCategoryBadgeClass;

  constructor(public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onDelete(): void {
    // Emit ID back to parent
    this.deleteConfirmed.emit(this.data._id);
    this.dialogRef.close({ deleted: true, id: this.data._id });
  }

  /** Helpers for template to safely get type/category */
  getSafeType(type?: NotificationType): NotificationType {
    return type ?? NotificationType.Info;
  }

  getSafeCategory(category?: NotificationCategory): NotificationCategory {
    return category ?? NotificationCategory.System;
  }
}