import { HttpInterceptorFn } from '@angular/common/http';
import { getActiveRole, getTokenKey } from '../../shared/utils/auth-storage.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const activeRole = getActiveRole();
    const token = activeRole ? localStorage.getItem(getTokenKey(activeRole)) : null;

    if (token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(cloned);
    }

    return next(req);
    
};