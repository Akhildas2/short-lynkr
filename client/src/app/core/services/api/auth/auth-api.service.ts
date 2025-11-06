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

  googleAuth(token: string, mode: 'register' | 'login'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/google-auth`, { token, mode });
  }

  verifyEmail(data: { email: string; otp: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/verify-email`, data);
  }

  resendOtp(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/resend-otp`, { email });
  }

  forgotPassword(data: { email: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/forgot-password`, data);
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/reset-password`, data);
  }

  getOtpRemainingTime(email: string) {
    return this.http.get<{ remaining: number }>(`${this.authApiUrl}/otp-remaining-time?email=${email}`);
  }

}