import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, AuthUser } from '../../../../models/auth/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private http: HttpClient) { }
  private readonly userApiUrl = environment.userApiUrl;

  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.userApiUrl}/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  editProfile(data: { username: string; email: string }) {
    return this.http.put<{ user: AuthUser }>(`${this.userApiUrl}/edit`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.put<{ message: string }>(`${this.userApiUrl}/change-password`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  deleteAccount() {
    return this.http.delete<{ message: string }>(`${this.userApiUrl}/delete`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

}