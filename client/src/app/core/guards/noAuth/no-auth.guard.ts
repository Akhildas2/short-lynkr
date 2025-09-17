import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getActiveRole } from '../../../shared/utils/auth-storage.util';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const activeRole = getActiveRole();
  if (activeRole) {
    const redirectTo = activeRole === 'admin' ? '/admin' : '/';
    return router.createUrlTree([redirectTo]);
  }

  return true;
  
};