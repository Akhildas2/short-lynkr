import { Component, Inject } from '@angular/core';
import { UrlEntry } from '../../../../models/url/url.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-customize-url-dialog',
  imports: [SharedModule],
  templateUrl: './customize-url-dialog.component.html',
  styleUrl: './customize-url-dialog.component.scss'
})
export class CustomizeUrlDialogComponent {
  updatedUrl: Partial<UrlEntry>;
  expiryDays: number = 0;
  tags: string[] = ['work', 'project', 'important', 'personal', 'temporary'];

  constructor(
    private dialogRef: MatDialogRef<CustomizeUrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UrlEntry
  ) {
    this.updatedUrl = { ...data };
    this.setInitialExpiryDays();
  }

  private setInitialExpiryDays(): void {
    if (this.data.expiresAt) {
      const today = new Date();
      const expiry = new Date(this.data.expiresAt);
      this.expiryDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  todayPlusDays(days: number): Date {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }


  save(): void {
    const result = { ...this.updatedUrl };
    if (this.expiryDays > 0) {
      result.expiresAt = this.todayPlusDays(this.expiryDays);
    } else {
      result.expiresAt = undefined;
    }

    if (!result.clickLimit && result.clickLimit !== 0) {
      result.clickLimit = undefined;
    }

    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close();
  }

}