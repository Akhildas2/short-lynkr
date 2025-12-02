import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocialQrEffects } from '../../../state/qr/social-qr.effects';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { SharedModule } from '../../../shared/shared.module';
import QRCode from 'qrcode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { sameColorValidator } from '../../../shared/utils/differentColorsValidator';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { noWhitespaceValidator } from '../../../shared/utils/noWhitespaceValidator';

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

  platforms = [
    'Facebook',
    'Instagram',
    'Twitter',
    'LinkedIn',
    'YouTube',
    'GitHub',
    'WhatsApp',
    'Telegram',
    'TikTok',
    'Snapchat',
    'Pinterest',
    'Reddit',
    'Discord',
    'Other'
  ];

  platformIcons: Record<string, string> = {
    Facebook: 'fab fa-facebook-f',
    Instagram: 'fab fa-instagram',
    Twitter: 'fab fa-twitter',
    LinkedIn: 'fab fa-linkedin-in',
    YouTube: 'fab fa-youtube',
    GitHub: 'fab fa-github',
    WhatsApp: 'fab fa-whatsapp',
    Telegram: 'fab fa-telegram-plane',
    TikTok: 'fab fa-tiktok',
    Snapchat: 'fab fa-snapchat-ghost',
    Pinterest: 'fab fa-pinterest-p',
    Reddit: 'fab fa-reddit-alien',
    Discord: 'fab fa-discord',
    Other: 'fas fa-globe'
  };

  platformBaseUrl: Record<string, string> = {
    Facebook: 'https://facebook.com/',
    Instagram: 'https://instagram.com/',
    LinkedIn: 'https://linkedin.com/in/',
    YouTube: 'https://youtube.com/@',
    Twitter: 'https://twitter.com/',
    GitHub: 'https://github.com/',
    WhatsApp: 'https://wa.me/',
    Telegram: 'https://t.me/',
    TikTok: 'https://www.tiktok.com/@',
    Snapchat: 'https://www.snapchat.com/add/',
    Pinterest: 'https://www.pinterest.com/',
    Reddit: 'https://www.reddit.com/user/',
    Discord: 'https://discord.com/users/',
    Other: ''
  };

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
    }, { validators: sameColorValidator });

    // Uppercase colors
    ['foregroundColor', 'backgroundColor'].forEach(colorField => {
      this.socialQrForm.get(colorField)!.valueChanges.subscribe(value => {
        this.socialQrForm.get(colorField)!.setValue(value.toUpperCase(), { emitEvent: false });
      });
    });

    // Platform change
    this.socialQrForm.get('platform')!.valueChanges.subscribe(platform => {
      const baseUrl = this.platformBaseUrl[platform] || '';
      if (platform !== 'Other') {
        this.socialQrForm.get('accountUrl')!.setValue(baseUrl);
        this.socialQrForm.get('accountUrl')!.disable({ emitEvent: false });
        this.socialQrForm.get('username')!.setValidators([Validators.required, Validators.maxLength(20), this.usernameFullUrlValidator, noWhitespaceValidator]);
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

  usernameFullUrlValidator(control: AbstractControl) {
    if (!control.value) return null;
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(control.value) ? { fullUrl: true } : null;
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
    const platform = this.socialQrForm.value.platform;
    const username = this.socialQrForm.value.username;

    if (!platform) return null;

    if (platform === 'Other') {
      return 'Enter the full URL of your profile (must start with http:// or https://)';
    }

    if (!username) {
      return `Base URL auto-filled: ${this.platformBaseUrl[platform]}`;
    }

    return null;
  }


  async submit() {
    if (this.socialQrForm.invalid) {
      return this.socialQrForm.markAllAsTouched();
    }

    console.log("form", this.socialQrForm.value);

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
    const { size, format, foregroundColor, backgroundColor } = this.socialQrForm.value;


    // Use getRawValue() to include disabled fields
    const formValues = this.socialQrForm.getRawValue();
    const finalUrl = url || (formValues.accountUrl + (formValues.username || ''));
    if (!finalUrl) return;

    const opts: QRCode.QRCodeToDataURLOptions = {
      width: size,
      margin: 2,
      color: { dark: foregroundColor, light: backgroundColor }
    };

    try {
      if (format === 'SVG') {
        const svgString = await QRCode.toString(finalUrl, { ...opts, type: 'svg' });
        this.qrRaw = svgString;
        this.qrPreview = this.sanitizer.bypassSecurityTrustHtml(svgString);
      } else {
        const dataUrl = await QRCode.toDataURL(finalUrl, opts);
        this.qrRaw = dataUrl;
        this.qrPreview = dataUrl;
      }

    } catch (err: any) {
      this.snackbarService.showError(err)
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