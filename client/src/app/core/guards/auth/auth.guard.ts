import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../state/auth/auth.store';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  _id: string;
  email: string;
  role: string;
}

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/auth/sign-in']);
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      authStore.clearAuth();
      localStorage.removeItem('token');
      router.navigate(['/auth/sign-in']);
      return false;
    }

    if (!authStore.isAuthenticated()) {
      authStore.setUser({ _id: decoded._id, email: decoded.email, role: decoded.role });
    }
    return true;

  } catch (error) {
    localStorage.removeItem('token');
    router.navigate(['/auth/sign-in']);
    return false;
  }

};
