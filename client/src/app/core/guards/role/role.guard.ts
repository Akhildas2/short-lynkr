import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '../../../state/auth/auth.store';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    const isAuthenticated = authStore.isAuthenticated();
    const userRole = authStore.userRole();

    if (!isAuthenticated || !allowedRoles.includes(userRole)) {
      router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    return true;
  };
}