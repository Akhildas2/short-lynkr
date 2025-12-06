import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MyUrlListComponent } from './my-url-list/my-url-list.component';
import { ShortUrlResultComponent } from './short-url-result/short-url-result.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { UserLayoutComponent } from '../../shared/components/layouts/user/user-layout/user-layout.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SocialQrListComponent } from './social-qr-list/social-qr-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'analytics/:id', component: AnalyticsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'my-urls', component: MyUrlListComponent },
      { path: 'shortened/:id', component: ShortUrlResultComponent },
      { path: 'my-urls', component: MyUrlListComponent },
      { path: 'my-qrs', component: SocialQrListComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
