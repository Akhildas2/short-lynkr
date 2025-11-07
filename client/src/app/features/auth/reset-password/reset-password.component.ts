import { Component } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-reset-password',
  imports: [UserHeaderComponent, UserFooterComponent,SharedModule,ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router, private authEffects: AuthEffects) {
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onResetPassword() {
  }

  navigateToLogin() {
    this.router.navigate(['/auth/sign-in']);
  }
}