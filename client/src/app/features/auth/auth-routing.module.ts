import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { noAuthGuard } from '../../core/guards/noAuth/no-auth.guard';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { path: 'verify-email', canActivate: [noAuthGuard], component: EmailVerificationComponent },
  { path: 'forgot-password', canActivate: [noAuthGuard], component: ForgotPasswordComponent },
  { path: 'reset-password', canActivate: [noAuthGuard], component: ResetPasswordComponent },
  { path: ':mode', canActivate: [noAuthGuard], component: AuthFormComponent },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }