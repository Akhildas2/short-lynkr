import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (token) {
    const role = localStorage.getItem('role');
    const redirectTo = role === 'admin' ? '/admin' : '/';
    return router.createUrlTree([redirectTo]);
  }

  return true;
};
