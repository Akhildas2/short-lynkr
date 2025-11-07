import { Component, inject } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { SharedModule } from '../../../shared/shared.module';
import { ValidationErrorComponent } from '../../../shared/components/forms/validation-error/validation-error.component';

@Component({
  selector: 'app-forgot-password',
  imports: [UserHeaderComponent, UserFooterComponent, SharedModule, ReactiveFormsModule, ValidationErrorComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authEffects = inject(AuthEffects);

  forgotForm: FormGroup;
  isLoading = false;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onForgotPassword() {
    if (this.forgotForm.invalid) return;
    this.isLoading = true;

    const { email } = this.forgotForm.value;
    try {
      await this.authEffects.forgotPassword(email);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/sign-in']);
  }
}