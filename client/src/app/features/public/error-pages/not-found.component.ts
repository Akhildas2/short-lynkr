import { Component } from '@angular/core';
import { SharedErrorLayoutComponent } from '../../../shared/components/layouts/shared-error-layout/shared-error-layout.component';
import { ErrorConfig } from '../../../models/error/errorConfig.interface';

@Component({
  selector: 'app-not-found',
  imports: [SharedErrorLayoutComponent],
  template: '<app-shared-error-layout [errorConfig]="errorConfig"></app-shared-error-layout>'

})
export class NotFoundComponent {
  errorConfig: ErrorConfig = {
    code: '404',
    title: 'Oops! Page Not Found',
    message: 'The page you are looking for doesn\'t exist or has been moved.',
    lightGif: 'assets/404-light.gif',
    darkGif: 'assets/404-dark.gif',
    numbers: ['4', '0', '4']
  };
}