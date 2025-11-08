import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { NotFoundComponent } from './error-pages/not-found.component';
import { BadGatewayComponent } from './error-pages/bad-gateway.component';
import { InternalErrorComponent } from './error-pages/internal-error.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '500', component: InternalErrorComponent },
  { path: '502', component: BadGatewayComponent },
  { path: '404', component: NotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
