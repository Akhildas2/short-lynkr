import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../Material.Module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-dialog',
  imports: [MaterialModule, CommonModule],
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.scss'
})
export class AlertDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      content: string;
      actionText?: string;
      actionRoute?: string;
      confirmOnly?: boolean;
    },
    private router: Router
  ) { }

  close(): void {
    this.dialogRef.close(false);
  }

  performAction(): void {
    this.dialogRef.close(true);

    if (this.data.confirmOnly) {
      this.dialogRef.close(true);
      return;
    }

    if (this.data.actionRoute) {
      this.router.navigate([this.data.actionRoute]);
    }
  }

}
