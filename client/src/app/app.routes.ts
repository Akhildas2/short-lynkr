import { Routes } from '@angular/router';
import { HomeComponent } from './features/common/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule) },
    { path: 'user', loadChildren: () => import('./features/user/user.module').then((m) => m.UserModule) },
    { path: 'common', loadChildren: () => import('./features/common/common.module').then((m) => m.MyCommonModule) },
];
