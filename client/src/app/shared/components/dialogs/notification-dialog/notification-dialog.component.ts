import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-notification-dialog',
  imports: [SharedModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent {
  @Output() deleteConfirmed = new EventEmitter<string>();

  constructor(public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onDelete(): void {
    // Emit ID back to parent
    this.deleteConfirmed.emit(this.data._id);
    this.dialogRef.close({ deleted: true, id: this.data._id });
  }
  
}