import { Component } from '@angular/core';
import { ErrorConfig, ErrorPageComponent } from '../../../shared/components/layouts/error-page/error-page.component';

@Component({
    selector: 'app-bad-gateway',
    standalone: true,
    imports: [ErrorPageComponent],
    template: '<app-error-page [errorConfig]="errorConfig"></app-error-page>'
})
export class BadGatewayComponent {
    errorConfig: ErrorConfig = {
        code: '502',
        title: 'Bad Gateway',
        message: 'The server encountered a temporary error. Please try again in a moment.',
        lightGif: 'assets/502-light.gif',
        darkGif: 'assets/502-dark.gif',
        numbers: ['5', '0', '2']
    };
}