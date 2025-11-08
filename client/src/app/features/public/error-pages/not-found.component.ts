import { Component } from '@angular/core';
import { ErrorConfig, ErrorPageComponent } from '../../../shared/components/layouts/error-page/error-page.component';

@Component({
  selector: 'app-not-found',
  imports: [ErrorPageComponent],
  template: '<app-error-page [errorConfig]="errorConfig"></app-error-page>'

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