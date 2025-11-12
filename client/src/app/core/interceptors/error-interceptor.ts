import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: any) => {
            // Ignore client errors (like 400) - handle in component
            if (error.status >= 400 && error.status < 500) {
                return throwError(() => error);
            }

            if (!navigator.onLine) {
                router.navigate(['/error'], { queryParams: { code: 0, message: 'You are offline.' } });
            } else if (error.status === 0) {
                router.navigate(['/error'], { queryParams: { code: 0, message: 'Cannot reach the server.' } });
            } else if ([500, 502, 503, 504].includes(error.status)) {
                router.navigate(['/error'], { queryParams: { code: error.status, message: error.message } });
            } else if (error.status === 404) {
                router.navigate(['/error'], { queryParams: { code: 404, message: error.message } });
            } else {
                router.navigate(['/error'], { queryParams: { code: error.status, message: error.message } });
            }

            return throwError(() => error);
        })
    );
};