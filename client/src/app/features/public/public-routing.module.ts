import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShortUrlResultComponent } from './short-url-result/short-url-result.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shortened/:id', component: ShortUrlResultComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
