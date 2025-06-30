import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthResponse } from '../../../../models/auth/auth.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly authApiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) { }

  register(user: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, credentials);
  }

}