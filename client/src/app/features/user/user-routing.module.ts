import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MyUrlListComponent } from './my-url-list/my-url-list.component';

const routes: Routes = [
  { path: 'analytics', component: StatisticsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'my-urls', component: MyUrlListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
