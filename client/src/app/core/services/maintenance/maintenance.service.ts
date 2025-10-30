import { effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { AdminApiService } from '../api/admin/admin-api.service';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { AuthStore } from '../../../state/auth/auth.store';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private socket!: Socket;

  public isMaintenanceSignal = signal(false);
  public initializedSignal = signal(false);

  private previousStatus: boolean = false;
  private initializing = false;
  private authStore = inject(AuthStore);

  constructor(private router: Router, private api: AdminApiService, private snackbar: SnackbarService, private authEffects: AuthEffects) {
    this.authEffects.checkAuthStatus();

    // Watch for maintenance mode and role changes
    effect(() => {
      if (!this.initializedSignal()) return;
      const isMaintenance = this.isMaintenanceSignal();
      const role = this.authStore.userRole();
      const url = this.router.url;

      // Non-admin users → maintenance page
      if (isMaintenance && role !== 'admin' && !url.startsWith('/maintenance')) {
        this.router.navigate(['/maintenance'], { queryParams: { code: 503 } });
      }

      // Admins → redirect to dashboard if on maintenance page
      if (role === 'admin' && isMaintenance && url.startsWith('/maintenance')) {
        this.router.navigate(['/admin/dashboard']);
      }

      // Maintenance ended → redirect from maintenance page
      if (!isMaintenance && url.startsWith('/maintenance')) {
        this.router.navigate(['/']);
      }
    });

    //  Initialize maintenance listener
    this.init();
  }

  /** Fetch initial maintenance status from API */
  async init(): Promise<void> {
    if (this.initializedSignal() || this.initializing) return;

    this.initializing = true;

    try {
      const settings = await firstValueFrom(this.api.getSettings());
      const systemSettings = settings?.systemSettings;

      if (systemSettings) {
        const now = new Date();
        const start = systemSettings.maintenanceStart ? new Date(systemSettings.maintenanceStart) : null;
        const end = systemSettings.maintenanceEnd ? new Date(systemSettings.maintenanceEnd) : null;
        const maintenanceFlag = systemSettings.maintenanceMode;

        let isActive = false;

        // Determine actual status
        if (maintenanceFlag) {
          if (!start || !end) {
            // Manual maintenance (no schedule)
            isActive = true;
          } else if (now >= start && now <= end) {
            // Scheduled maintenance currently active
            isActive = true;
          } else {
            // Scheduled for future or past
            isActive = false;
          }
        }

        this.previousStatus = isActive;
        this.isMaintenanceSignal.set(isActive);
      } else {
        this.isMaintenanceSignal.set(false);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      this.isMaintenanceSignal.set(false); // fallback
    } finally {
      this.initializedSignal.set(true);
      this.initializing = false;
    }

    this.connectSocket();
  }

  /** Connect socket for real-time updates */
  private connectSocket(): void {
    this.socket = io(environment.baseApiUrl);

    this.socket.on('maintenanceMode', (status: boolean) => {
      if (this.previousStatus !== status) {
        if (status) this.snackbar.showInfo('Maintenance started! The app will be back soon.');
        else this.snackbar.showSuccess('Maintenance finished! The app is back online.');
      }

      this.previousStatus = status;
      this.isMaintenanceSignal.set(status);
    });
  }

  /** Wait until initialized (used in guards) */
  async waitForInit(): Promise<void> {
    if (this.initializedSignal()) return;
    await this.init();
  }

  /** Manually connect the socket */
  connect(): void {
    if (!this.socket.connected) this.socket.connect();
  }

  /** Manually disconnect the socket */
  disconnect(): void {
    if (this.socket.connected) this.socket.disconnect();
  }

}