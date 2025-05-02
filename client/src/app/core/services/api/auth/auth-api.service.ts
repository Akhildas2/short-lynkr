import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../../../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) { }

  register(user: { username: string; email: string; password: string }) {
    return this.http.post<{ user: AuthUser; token: string }>(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ user: AuthUser; token: string }>(`${this.apiUrl}/login`, credentials);
  }
}
