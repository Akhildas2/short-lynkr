import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLayoutComponent } from '../../shared/components/layouts/admin/admin-layout/admin-layout.component';
import { UsersManagementComponent } from './users-management/users-management.component';
import { UrlsManagementComponent } from './urls-management/urls-management.component';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'urls', component: UrlsManagementComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
