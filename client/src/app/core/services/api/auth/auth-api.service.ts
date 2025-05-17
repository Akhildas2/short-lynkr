import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthResponse } from '../../../../models/auth/auth.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) { }

  register(user: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  getProfile(): Observable<AuthResponse> {
    const token = localStorage.getItem('token');
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}
