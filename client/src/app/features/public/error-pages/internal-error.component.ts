import { Component } from '@angular/core';
import { SharedErrorLayoutComponent } from '../../../shared/components/layouts/shared-error-layout/shared-error-layout.component';
import { ErrorConfig } from '../../../models/error/errorConfig.interface';

@Component({
    selector: 'app-internal-error',
    imports: [SharedErrorLayoutComponent],
    template: '<app-shared-error-layout [errorConfig]="errorConfig"></app-shared-error-layout>'
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