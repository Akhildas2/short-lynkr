
import { Component } from '@angular/core';
import { ErrorConfig, ErrorPageComponent } from '../../../shared/components/layouts/error-page/error-page.component';

@Component({
    selector: 'app-internal-error',
    standalone: true,
    imports: [ErrorPageComponent],
    template: '<app-error-page [errorConfig]="errorConfig"></app-error-page>'
})
export class InternalErrorComponent {
    errorConfig: ErrorConfig = {
        code: '500',
        title: 'Internal Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        lightGif: 'assets/500-light.gif',
        darkGif: 'assets/500-dark.gif',
        numbers: ['5', '0', '0']
    };
}