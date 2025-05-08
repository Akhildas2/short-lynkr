import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { authEffects } from '../../../state/auth/auth.effects';
import { ValidationErrorComponent } from '../../../shared/components/validation-error/validation-error/validation-error.component';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule, FormsModule, ReactiveFormsModule, ValidationErrorComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isActive = false;
  showLoginPassword = signal(false);
  showRegisterPassword = signal(false);

  constructor(private fb: FormBuilder, private effects: authEffects) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]]
    });
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`])[A-Za-z\\d!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`]{8,}$')]]
    });
  }

  toggleForm() {
    this.isActive = !this.isActive;
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
    const { username, email, password } = this.registerForm.value;
    await this.effects.register(username, email, password);
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    await this.effects.login(email, password);
  }

}
