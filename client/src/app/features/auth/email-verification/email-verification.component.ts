import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-email-verification',
  imports: [SharedModule, ReactiveFormsModule, ThemeToggleComponent],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss'
})
export class EmailVerificationComponent implements OnInit {
  otpForm: FormGroup;
  timer = 0;
  intervalId: any;
  email = '';
  isLoading = false;
  readonly OTP_TIMEOUT = 120;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authEffect: AuthEffects, private snackbar: SnackbarService) {
    this.otpForm = this.fb.group(
      {
        otp0: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
        otp1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
        otp2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
        otp3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
        otp4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
        otp5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      },
      { validators: this.otpCompleteValidator }
    );
  }

  async ngOnInit(): Promise<void> {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    // Fetch remaining OTP time from backend
    const remaining = await this.authEffect.fetchOtpRemainingTime(this.email);

    // If remaining > 0, continue countdown, else timer stays 0
    this.timer = remaining;

    if (this.timer > 0) {
      this.startTimer();
    }

    // Focus first input
    setTimeout(() => this.otpInputs?.first.nativeElement.focus(), 0);
  }

  /**  Custom validator to check all fields */
  otpCompleteValidator(group: AbstractControl): ValidationErrors | null {
    const controls = (group as FormGroup).controls;
    const allFilled = Object.values(controls).every(ctrl => /^[0-9]$/.test(ctrl.value));
    return allFilled ? null : { incompleteOtp: true };
  }

  /**  Handle OTP input focus movement */
  onOtpInput(e: KeyboardEvent, index: number): void {
    const input = e.target as HTMLInputElement;
    let value = input.value;

    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    this.otpForm.markAsTouched();

    if (index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }

  }

  /**  Handle backspace navigation */
  onKeyDown(e: KeyboardEvent, index: number): void {
    if (e.key === 'Backspace' && index > 0 && !(e.target as HTMLInputElement).value) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  /** Submit OTP */
  async submitOtp(): Promise<void> {
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) return;
    if (!this.email) {
      this.snackbar.showError('Email is missing. Cannot verify OTP.');
      return;
    }

    this.isLoading = true;
    const otp = Object.values(this.otpForm.value).join('');

    try {
      await this.authEffect.verifyEmail(this.email, otp);
    } finally {
      this.isLoading = false;
    }
  }

  /** Resend OTP */
  async resendOtp(): Promise<void> {
    if (!this.email) {
      this.snackbar.showError('Email is missing. Cannot verify OTP.');
      return;
    }
    if (this.isLoading || !this.email) return;

    this.isLoading = true;
    try {
      await this.authEffect.resendOtp(this.email);

      // Reset OTP form
      this.otpForm.reset();
      setTimeout(() => this.otpInputs.first.nativeElement.focus(), 0);

      // Start new OTP timer (full timeout)
      this.timer = this.OTP_TIMEOUT;
      this.startTimer();
    } finally {
      this.isLoading = false;
    }
  }

  /** Start countdown timer */
  private startTimer(): void {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

}