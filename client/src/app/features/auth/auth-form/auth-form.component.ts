import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { authEffects } from '../../../state/auth/auth.effects';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule, FormsModule,ReactiveFormsModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isActive = false;

  constructor( private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]]
    });
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')]]
    });
  }


  toggleForm() {
    this.isActive = !this.isActive;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    const { email, password } = this.loginForm.value;
   
  }
  
  onRegister() {
    if (this.registerForm.invalid) {
   
      this.registerForm.markAllAsTouched();
      return;
    }
  
    const { username, email, password } = this.registerForm.value;
    
   
  }
}
