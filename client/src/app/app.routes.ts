import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/role/role.guard';
import { noAuthGuard } from './core/guards/noAuth/no-auth.guard';
import { homeGuard } from './core/guards/homeGuard/home.guard';
import { maintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { MaintenanceComponent } from './features/public/maintenance/maintenance.component';

export const routes: Routes = [
    {
        path: '',
        canActivate: [maintenanceGuard, homeGuard],
        loadChildren: () => import('./features/public/public.module').then((m) => m.PublicModule)
    },
    {
        path: 'admin',
        canActivate: [maintenanceGuard, authGuard, roleGuard(['admin'])],
        loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
    },
    {
        path: 'user',
        canActivate: [maintenanceGuard, authGuard, roleGuard(['user'])],
        loadChildren: () => import('./features/user/user.module').then((m) => m.UserModule)
    },
    {
        path: 'auth',
        canActivate: [noAuthGuard],
        loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule)
    },
    {
        path: 'maintenance',
        component: MaintenanceComponent
    },
    {
        path: '**',
        redirectTo: '404'
    }
];