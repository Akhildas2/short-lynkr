import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../shared/components/layouts/admin/admin-layout/admin-layout.component';
import { UrlsManagementComponent } from './urls-management/urls-management.component';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminNotificationComponent } from './admin-notification/admin-notification.component';
import { UsersManagementComponent } from './users-management/users-management.component';
import { AdminSocialQrComponent } from './admin-social-qr/admin-social-qr.component';
import { AdminContactComponent } from './admin-contact/admin-contact.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'urls', component: UrlsManagementComponent },
      { path: 'qrs', component: AdminSocialQrComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'notifications', component: AdminNotificationComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'inquiries', component: AdminContactComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }