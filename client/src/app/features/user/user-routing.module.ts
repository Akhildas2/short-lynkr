import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MyUrlListComponent } from './my-url-list/my-url-list.component';
import { ShortUrlResultComponent } from './short-url-result/short-url-result.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { UserLayoutComponent } from '../../shared/components/user-layout/user-layout/user-layout.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'analytics/:id', component: AnalyticsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'my-urls', component: MyUrlListComponent },
      { path: 'shortened/:id', component: ShortUrlResultComponent },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
