import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendHealthService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  backendDown = signal(false);

  markDown() {
    this.backendDown.set(true);
  }

  markUp() {
    this.backendDown.set(false);
  }

  async checkHealth(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(`${this.api}/health`, { headers: { 'x-health-check': 'true' } })
      );

      if (this.backendDown()) {
        this.markUp();
      }
      return true;

    } catch {
      return false;
    }
  }

}