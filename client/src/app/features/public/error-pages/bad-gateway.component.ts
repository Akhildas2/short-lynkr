import { Component } from '@angular/core';
import { ErrorConfig } from '../../../models/error/errorConfig.interface';
import { SharedErrorLayoutComponent } from '../../../shared/components/layouts/shared-error-layout/shared-error-layout.component';

@Component({
    selector: 'app-bad-gateway',
    imports: [SharedErrorLayoutComponent],
    template: '<app-shared-error-layout [errorConfig]="errorConfig"></app-shared-error-layout>'
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