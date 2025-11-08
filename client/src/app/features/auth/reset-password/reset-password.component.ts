import { Component, OnInit } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { SharedModule } from '../../../shared/shared.module';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';

@Component({
  selector: 'app-reset-password',
  imports: [UserHeaderComponent, UserFooterComponent, SharedModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  showPassword = false;
  email: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authEffects: AuthEffects, private route: ActivatedRoute, private snackbar: SnackbarService) {
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
      )
      ]]
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get otp() {
    return this.resetForm.get('otp');
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get newPasswordError(): string | null {
    const control = this.resetForm.get('newPassword');
    if (!control || !control.touched) return null;

    if (control.hasError('required')) return 'New password is required';
    if (control.hasError('minlength')) return 'Password must be at least 8 characters long';
    if (control.hasError('maxlength')) return 'Password cannot exceed 16 characters';
    if (control.hasError('pattern')) return 'Password must include uppercase, lowercase, number, and special character';

    return null;
  }

  async onResetPassword() {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    if (!this.email) {
      this.snackbar.showError('Email is missing. Cannot reset password.');
      return;
    }

    const { otp, newPassword } = this.resetForm.value;

    try {
      await this.authEffects.resetPassword(this.email, otp, newPassword);
    } finally {
      this.isLoading = false;
    }

  }

  navigateToLogin() {
    this.router.navigate(['/auth/sign-in']);
  }
}