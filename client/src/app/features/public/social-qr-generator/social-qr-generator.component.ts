import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocialQrEffects } from '../../../state/qr/social-qr.effects';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { SharedModule } from '../../../shared/shared.module';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { noWhitespaceValidator } from '../../../shared/utils/noWhitespaceValidator';
import { PLATFORM_BASE_URL, PLATFORM_ICONS, PLATFORMS } from '../../../shared/utils/platform.helper';
import { getProfileHint, usernameFullUrlValidator } from '../../../shared/utils/username.helper';
import { uppercaseColor } from '../../../shared/utils/color.helper';
import { generateQr } from '../../../shared/utils/generateQr.helper';
import { colorContrastValidator } from '../../../shared/utils/colorValidator';

@Component({
  selector: 'app-social-qr-generator',
  imports: [SharedModule, SpinnerComponent, ReactiveFormsModule, UserHeaderComponent, UserFooterComponent],
  templateUrl: './social-qr-generator.component.html',
  styleUrl: './social-qr-generator.component.scss'
})
export class SocialQrGeneratorComponent implements OnInit {
  socialQrForm!: FormGroup;
  isLoading = false;
  qrPreview: string | SafeHtml | null = null;
  qrRaw: string | null = null;
  lastSubmittedQr: any = null;
  lastSubmittedName: string | null = null;

  platforms = PLATFORMS;
  platformIcons = PLATFORM_ICONS;
  platformBaseUrl = PLATFORM_BASE_URL;
  formats = ['PNG', 'JPEG', 'SVG'];
  QR_SIZES = [300, 500, 750, 1024];

  constructor(private fb: FormBuilder, private socialQrEffects: SocialQrEffects, private sanitizer: DomSanitizer, private snackbarService: SnackbarService, private authEffects: AuthEffects, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.socialQrForm = this.fb.group({
      platform: ['', Validators.required],
      username: [''],
      accountUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      size: [300, Validators.required],
      format: ['PNG', Validators.required],
      foregroundColor: ['#000000', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      backgroundColor: ['#ffffff', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]]
    }, { validators: colorContrastValidator });

    // Uppercase colors
    ['foregroundColor', 'backgroundColor'].forEach(colorField => {
      this.socialQrForm.get(colorField)!.valueChanges.subscribe(value => uppercaseColor(this.socialQrForm.get(colorField)!));
    });

    // Platform change
    this.socialQrForm.get('platform')!.valueChanges.subscribe(platform => {
      const baseUrl = this.platformBaseUrl[platform] || '';
      if (platform !== 'Other') {
        this.socialQrForm.get('accountUrl')!.setValue(baseUrl);
        this.socialQrForm.get('accountUrl')!.disable({ emitEvent: false });
        this.socialQrForm.get('username')!.setValidators([Validators.required, Validators.maxLength(20), usernameFullUrlValidator, noWhitespaceValidator]);
      } else {
        this.socialQrForm.get('accountUrl')!.setValue('');
        this.socialQrForm.get('accountUrl')!.enable({ emitEvent: false });
        this.socialQrForm.get('username')!.clearValidators();
      }
      this.socialQrForm.get('username')!.updateValueAndValidity();
      this.socialQrForm.get('accountUrl')!.updateValueAndValidity();
    });


    // Live preview
    this.socialQrForm.valueChanges.subscribe(() => {
      if (this.socialQrForm.valid) {
        this.generateQr();
      } else {
        this.qrPreview = null;
      }
    });

  }


  getUsernameError(): string | null {
    const control = this.socialQrForm.get('username');
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return 'Username is required.';
    }
    if (control.hasError('maxlength')) {
      return 'Username cannot exceed 20 characters.';
    }
    if (control.hasError('fullUrl')) {
      return 'Please enter only the username, not a full URL.';
    }
    if (control.hasError('whitespace')) {
      return 'Username cannot contain spaces.';
    }

    return null;
  }


  getProfileHint(): string | null {
    return getProfileHint(
      this.socialQrForm.value.platform,
      this.socialQrForm.value.username
    );
  }


  async submit() {
    if (this.socialQrForm.invalid) {
      return this.socialQrForm.markAllAsTouched();
    }

    const isAuthenticated = await this.authEffects.checkAuthStatus();
    if (!isAuthenticated) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: 'Sign In Required',
          content: 'This feature is only available to logged-in users. Please sign in to continue.',
          actionText: 'Sign In',
          actionIcon: 'trending_flat',
          actionRoute: '/auth/sign-in',
          confirmOnly: false
        }
      });
      return;
    }

    const formValues = this.socialQrForm.getRawValue();
    const finalUrl = formValues.platform !== 'Other'
      ? `${formValues.accountUrl}${formValues.username}`
      : formValues.accountUrl;

    // Exclude username from payload
    const { username, ...rest } = this.socialQrForm.value;
    const dataToSend = {
      ...rest,
      accountUrl: finalUrl
    };

    this.isLoading = true;

    try {
      // Generate QR first
      await this.generateQr(finalUrl);

      // Submit QR data to backend
      const qr = await this.socialQrEffects.createSocialQr(dataToSend);
      if (qr) {
        this.lastSubmittedQr = qr;
        this.lastSubmittedName = qr.platform || formValues.platform;
        this.qrPreview = this.qrPreview
      }
    } catch (err: any) {
      this.snackbarService.showError(err)
    } finally {
      this.isLoading = false;
    }
  }

  async generateQr(url?: string) {
    const formValues = this.socialQrForm.getRawValue();
    const finalUrl = url || (formValues.accountUrl + (formValues.username || ''));
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

  resetForm(): void {
    this.socialQrForm.reset({
      platform: '',
      username: '',
      accountUrl: '',
      size: 300,
      format: 'PNG',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff'
    });

    this.socialQrForm.get('accountUrl')!.enable({ emitEvent: false });
    this.socialQrForm.get('username')!.clearValidators();
    this.socialQrForm.get('username')!.updateValueAndValidity();

    this.qrPreview = null;
    this.lastSubmittedQr = null;
    this.lastSubmittedName = null;
  }

  downloadQr(): void {
    if (!this.qrRaw) return;

    const link = document.createElement('a');
    const format = this.socialQrForm.value.format.toLowerCase();

    if (format === 'svg') {
      const blob = new Blob([this.qrRaw], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
    } else {
      link.href = this.qrRaw;
    }

    const name = this.socialQrForm.value.platform || 'social-qr';
    link.download = `${name}.${format}`;
    link.click();
  }

  refreshQr(): void {
    if (!this.socialQrForm.value.accountUrl) return;
    this.isLoading = true;
    this.qrPreview = null;
    this.generateQr();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }


}