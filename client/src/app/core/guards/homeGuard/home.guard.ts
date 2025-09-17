import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getActiveRole } from '../../../shared/utils/auth-storage.util';

export const homeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const activeRole = getActiveRole();

  if (activeRole === 'admin') {
    return router.createUrlTree(['/admin']);
  }

  return true; // users or guests can see home page

};