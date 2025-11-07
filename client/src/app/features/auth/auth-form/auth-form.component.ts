import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { ValidationErrorComponent } from '../../../shared/components/forms/validation-error/validation-error.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/ui/loader/loader.component';
import { GoogleAuthEffects } from '../../../state/auth/googleAuth.effects';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';

@Component({
  selector: 'app-auth-form',
  imports: [CommonModule, UserHeaderComponent, UserFooterComponent, MaterialModule, FormsModule, ReactiveFormsModule, ValidationErrorComponent, LoaderComponent, RouterLink],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  appName = signal('Short Lynkr');
  loginForm: FormGroup;
  registerForm: FormGroup;
  isActive = false;
  isLoading = false;
  showLoginPassword = signal(false);
  showRegisterPassword = signal(false);

  constructor(private fb: FormBuilder, private authEffects: AuthEffects, private googleAuthEffects: GoogleAuthEffects, private route: ActivatedRoute, private router: Router, private settingsEffect: AdminSettingsEffects) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]]
    });
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`])[A-Za-z\\d!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`]{8,}$')]]
    });

    this.route.params.subscribe(params => {
      const mode = params['mode'];
      this.isActive = mode === 'sign-up';
    });

    effect(() => {
      const settings = this.settingsEffect['store'].settings();
      this.appName.set(settings?.systemSettings?.appName || 'Short Lynkr');
    });

  }

  toggleForm() {
    const newMode = this.isActive ? 'sign-in' : 'sign-up';
    this.router.navigate(['/auth', newMode]);
  }

  toggleLoginPassword() {
    this.showLoginPassword.set(!this.showLoginPassword());
  }

  toggleRegisterPassword() {
    this.showRegisterPassword.set(!this.showRegisterPassword());
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username, email, password } = this.registerForm.value;

    setTimeout(async () => {
      await this.authEffects.register(username, email, password);
      this.isLoading = false;
    }, 3000);
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    setTimeout(async () => {
      await this.authEffects.login(email, password);
      this.isLoading = false;
    }, 3000);
  }

  async onGoogleRegister() {
    this.isLoading = true;
    try { await this.googleAuthEffects.googleRegister(); }
    finally { this.isLoading = false; }
  }

  async onGoogleLogin() {
    this.isLoading = true;
    try { await this.googleAuthEffects.googleLogin(); }
    finally { this.isLoading = false; }
  }


}
