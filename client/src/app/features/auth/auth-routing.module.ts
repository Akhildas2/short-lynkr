import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { noAuthGuard } from '../../core/guards/noAuth/no-auth.guard';

const routes: Routes = [
  { path: ':mode', canActivate: [noAuthGuard], component: AuthFormComponent },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
