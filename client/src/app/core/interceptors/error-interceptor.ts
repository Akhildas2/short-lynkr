import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, catchError, tap } from 'rxjs';

const defaultMessages: Record<number, string> = {
    0: 'Unable to connect. Please check your internet connection.',
    404: 'The requested resource was not found.',
    500: 'Something went wrong on our server.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service temporarily unavailable.',
    504: 'Server timeout. Please try again.'
};
let backendDown = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        tap(() => {
            if (backendDown) {
                backendDown = false;
                router.navigate(['/home']);
            }
        }),
        catchError((error: any) => {
            if (error.status >= 500 || error.status === 0) {
                backendDown = true;
            }

            // existing error logic
            let message = !navigator.onLine || error.status === 0
                ? defaultMessages[0]
                : error.error?.message || defaultMessages[error.status] || 'Unexpected error occurred';

            router.navigate(['/error'], { queryParams: { code: error.status ?? 0, message } });

            return throwError(() => error);
        })
    );
};