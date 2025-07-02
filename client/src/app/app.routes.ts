import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/role/role.guard';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./features/public/public.module').then((m) => m.PublicModule) },
    { path: 'admin', canActivate: [authGuard, roleGuard(['admin'])], loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule) },
    { path: 'user', canActivate: [authGuard, roleGuard(['user'])], loadChildren: () => import('./features/user/user.module').then((m) => m.UserModule) },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule) },
    { path: '**', redirectTo: 'not-found' }
];
