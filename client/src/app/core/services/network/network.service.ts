import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private wasOffline = false;

  constructor(private router: Router) {
    // When network goes offline
    window.addEventListener('offline', () => {
      this.wasOffline = true;
      this.router.navigate(['/error'], {
        queryParams: { code: 0, message: 'You are offline.' }
      });
    });

    // When network comes back online
    window.addEventListener('online', () => {
      if (this.wasOffline) {
        this.wasOffline = false;
        this.router.navigate(['/']); // Redirect to home
      }
    });
  }

}
