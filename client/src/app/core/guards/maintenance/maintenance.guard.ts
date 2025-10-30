import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance/maintenance.service';

export const maintenanceGuard: CanActivateFn = async (route, state) => {
  const maintenanceService = inject(MaintenanceService);
  const router = inject(Router);
  const url = state.url;


  // Wait for maintenance service initialization
  await maintenanceService.waitForInit();

  // Always allow admin/auth
  if (url.startsWith('/admin') || url.startsWith('/auth')) return true;

  // Redirect to maintenance page if needed
  if (maintenanceService.isMaintenanceSignal()) {
    return router.createUrlTree(['/maintenance']);
  }

  return true;

};