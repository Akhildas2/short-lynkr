import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, catchError, tap } from 'rxjs';
import { BackendHealthService } from '../services/backend-health/backend-health.service';

const SERVER_ERRORS = [0, 500, 502, 503, 504];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const health = inject(BackendHealthService);

    if (req.url.includes('/api/health')) {
        return next(req);
    }

    return next(req).pipe(
        catchError((error: any) => {

            // Client/auth errors → handled by component
            if (error.status >= 400 && error.status < 500) {
                return throwError(() => error);
            }

            // Backend/network down
            if (SERVER_ERRORS.includes(error.status)) {
                if (!health.backendDown()) {
                    health.markDown();

                    router.navigate(['/error'], {
                        queryParams: {
                            code: error.status ?? 0,
                            message: !navigator.onLine
                                ? 'You are offline.'
                                : 'Service temporarily unavailable'
                        }
                    });

                }
            }

            return throwError(() => error);
        })
    );
};