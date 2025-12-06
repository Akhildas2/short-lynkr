import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SocialQrEffects } from '../../../../state/qr/social-qr.effects';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { noWhitespaceValidator } from '../../../utils/noWhitespaceValidator';
import { SocialQrEntry } from '../../../../models/qr/socialQr.interface';
import { SharedModule } from '../../../shared.module';
import { PLATFORM_BASE_URL, PLATFORM_ICONS, PLATFORMS } from '../../../utils/platform.helper';
import { getProfileHint } from '../../../utils/username.helper';
import { platformUrlValidator } from '../../../utils/platformUrlValidator.helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { generateQr } from '../../../utils/generateQr.helper';
import { uppercaseColor } from '../../../utils/color.helper';
import { colorContrastValidator } from '../../../utils/colorValidator';

export interface SocialQrDialogData {
  mode: 'view' | 'edit';
  qrEntry: SocialQrEntry;
}

@Component({
  selector: 'app-social-qr-dialog',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './social-qr-dialog.component.html',
  styleUrl: './social-qr-dialog.component.scss'
})
export class SocialQrDialogComponent implements OnInit {
  qrForm!: FormGroup;
  isEditMode = false;
  platforms = PLATFORMS;
  platformIcons = PLATFORM_ICONS;
  platformBaseUrl = PLATFORM_BASE_URL;
  formats = ['PNG', 'JPEG', 'SVG'];
  QR_SIZES = [300, 500, 750, 1024];
  qrPreview: string | SafeHtml | null = null;
  qrRaw: string | null = null;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<SocialQrDialogComponent>,
    private socialQrEffects: SocialQrEffects,
    private snackbar: SnackbarService,
    private sanitizer: DomSanitizer,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: SocialQrDialogData) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    const qr = this.data.qrEntry;
    // Handle both base64 data URL and inline SVG
    if (qr.qrCodeUrl) {
      if (qr.format === 'SVG') {
        if (qr.qrCodeUrl.startsWith('data:image/svg+xml;base64,')) {
          // Decode base64 SVG
          const base64Data = qr.qrCodeUrl.split(',')[1];
          const decodedSvg = atob(base64Data);
          this.qrPreview = this.sanitizer.bypassSecurityTrustHtml(decodedSvg);
        } else {
          // Inline SVG
          this.qrPreview = this.sanitizer.bypassSecurityTrustHtml(qr.qrCodeUrl);
        }
      } else {
        // PNG, JPEG
        this.qrPreview = qr.qrCodeUrl;
      }
    }

    this.qrForm = this.fb.group({
      platform: [{ value: qr.platform, disabled: !this.isEditMode }, Validators.required],
      accountUrl: [{ value: qr.accountUrl, disabled: !this.isEditMode }, [Validators.required, Validators.pattern(/^https?:\/\/.+/), noWhitespaceValidator]],
      size: [{ value: qr.size, disabled: !this.isEditMode }, Validators.required],
      format: [{ value: qr.format, disabled: !this.isEditMode }, Validators.required],
      foregroundColor: [{ value: qr.foregroundColor, disabled: !this.isEditMode }, [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      backgroundColor: [{ value: qr.backgroundColor, disabled: !this.isEditMode }, [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
    }, { validators: colorContrastValidator });

    // Subscribe to changes
    this.qrForm.valueChanges.subscribe(() => {
      if (this.qrForm.valid && this.isEditMode) {
        this.generateQr();
      }
    });

    // Uppercase colors
    ['foregroundColor', 'backgroundColor'].forEach(colorField => {
      this.qrForm.get(colorField)!.valueChanges.subscribe(value => uppercaseColor(this.qrForm.get(colorField)!));
    });


    // Subscribe to changes in platform and accountUrl
    this.qrForm.get('platform')?.valueChanges.subscribe(() => {
      this.qrForm.get('accountUrl')?.updateValueAndValidity({ onlySelf: true });
    });

    this.qrForm.get('accountUrl')?.setValidators([
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/),
      noWhitespaceValidator,
      platformUrlValidator()
    ]);
  }


  async generateQr() {
    const formValues = this.qrForm.getRawValue();
    const finalUrl = formValues.accountUrl;
    if (!finalUrl) return;

    try {
      const { qrPreview, qrRaw } = await generateQr({
        url: finalUrl,
        size: formValues.size,
        format: formValues.format,
        foregroundColor: formValues.foregroundColor,
        backgroundColor: formValues.backgroundColor,
        sanitizer: this.sanitizer
      });

      this.qrPreview = qrPreview;
      this.qrRaw = qrRaw;

    } catch (err: any) {
      this.snackbarService.showError(err);
    }
  }

  getProfileUrlError(): string | null {
    const control = this.qrForm.get('accountUrl');
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return 'URL is required.';
    }

    if (control.hasError('pattern')) {
      return 'Enter a valid full URL (must start with http:// or https://).';
    }

    if (control.hasError('platformUrl')) {
      const err = control.getError('platformUrl');
      return `URL must start with ${err.requiredBase}`;
    }

    return null;
  }


  getProfileHint(): string | null {
    return getProfileHint(
      this.qrForm.value.platform,
      this.qrForm.value.username
    );
  }

  async save() {
    if (this.qrForm.invalid) return this.qrForm.markAllAsTouched();

    const updatedData = this.qrForm.getRawValue();
    try {
      await this.socialQrEffects.updateSocialQr(this.data.qrEntry._id, updatedData);
      this.dialogRef.close(true);
    } catch (err) {
      this.snackbar.showError('Failed to update QR.');
    }
  }

  close() {
    this.dialogRef.close(false);
  }

}