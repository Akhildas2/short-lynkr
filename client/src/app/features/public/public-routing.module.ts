import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './error-pages/not-found.component';
import { BadGatewayComponent } from './error-pages/bad-gateway.component';
import { InternalErrorComponent } from './error-pages/internal-error.component';
import { ErrorPageComponent } from './error-pages/error-page.component';
import { SocialQrGeneratorComponent } from './social-qr-generator/social-qr-generator.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'qr-generator', component: SocialQrGeneratorComponent },
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
