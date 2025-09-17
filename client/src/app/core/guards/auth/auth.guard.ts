import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../state/auth/auth.store';
import { jwtDecode } from 'jwt-decode';
import { clearActiveRole, getActiveRole, getTokenKey } from '../../../shared/utils/auth-storage.util';

interface JwtPayload {
  exp: number;
  _id: string;
  email: string;
  role: string;
}

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const activeRole = getActiveRole();
  if (!activeRole) {
    return router.createUrlTree(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
  }

  const token = localStorage.getItem(getTokenKey(activeRole));
  if (!token) {
    return router.createUrlTree(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      authStore.clearAuth();
      localStorage.removeItem(getTokenKey(activeRole));
      clearActiveRole();
      return router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
    }

    if (!authStore.isAuthenticated()) {
      authStore.setUser({ _id: decoded._id, email: decoded.email, role: decoded.role });
      authStore.setToken(token);
    }

    return true;

  } catch {
    authStore.clearAuth();
    localStorage.removeItem(getTokenKey(activeRole));
    clearActiveRole();
    router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
    return false;
  }

};