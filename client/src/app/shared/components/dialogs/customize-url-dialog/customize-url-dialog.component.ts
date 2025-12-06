import { Component, Inject, OnInit } from '@angular/core';
import { UrlEntry } from '../../../../models/url/url.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared.module';
import { AdminSettings } from '../../../../models/settings/adminSettings.interface';
import { AdminSettingsEffects } from '../../../../state/settings/settings.effects';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-customize-url-dialog',
  imports: [SharedModule],
  templateUrl: './customize-url-dialog.component.html',
  styleUrl: './customize-url-dialog.component.scss'
})
export class CustomizeUrlDialogComponent implements OnInit {
  updatedUrl: Partial<UrlEntry>;
  expiryDays: number = 0;
  tags: string[] = ['Personal', 'Work', 'Project', 'Marketing', 'important', 'Other'];
  settings: AdminSettings | null = null;

  constructor(
    private dialogRef: MatDialogRef<CustomizeUrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UrlEntry,
    private settingsEffects: AdminSettingsEffects,
    private snackbar: SnackbarService
  ) {
    this.updatedUrl = { ...data };
    this.setInitialExpiryDays();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.settings = await this.settingsEffects.loadSettings();
    } catch (e: any) {
      this.snackbar.showError(e)
    }
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

  get clickLimitInvalid(): boolean {
    return typeof this.updatedUrl.clickLimit === 'number'
      && this.data
      && this.updatedUrl.clickLimit > 0
      && this.updatedUrl.clickLimit <= this.data.clicks;
  }


  save(): void {
    const result = { ...this.updatedUrl };

    if (this.expiryDays > 0) {
      const maxExpiry = this.settings?.urlSettings?.expirationDaysLimit || 100;
      result.expiresAt = this.todayPlusDays(Math.min(this.expiryDays, maxExpiry));
    } else {
      result.expiresAt = undefined;
    }

    if (!result.clickLimit && result.clickLimit !== 0) {
      result.clickLimit = undefined;
    }

    if (result.clickLimit !== undefined) {
      const maxClick = this.settings?.urlSettings?.maxClickPerUrl || 1000;
      result.clickLimit = Math.min(result.clickLimit, maxClick);
    }

    if (!this.settings?.urlSettings?.allowCustomSlugs) {
      result.shortId = undefined;
    }

    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    // Short Code validation
    const shortIdInvalid = this.settings?.urlSettings?.allowCustomSlugs
      && (!this.updatedUrl.shortId
        || this.updatedUrl.shortId.length < 4
        || this.updatedUrl.shortId.length > (this.settings.urlSettings.defaultLength || 8));

    // Click Limit validation
    const clickInvalid = this.clickLimitInvalid;

    // Expiry Days validation
    const maxExpiry = this.settings?.urlSettings?.expirationDaysLimit || 100;
    const expiryInvalid = this.expiryDays < 0 || this.expiryDays > maxExpiry;

    return shortIdInvalid || clickInvalid || expiryInvalid;
  }

}