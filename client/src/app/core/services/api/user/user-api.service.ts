import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../../../../models/auth/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private http: HttpClient) { }
  private readonly userApiUrl = environment.userApiUrl;

  getProfile(): Observable<AuthResponse> {
    const token = localStorage.getItem('token');
    return this.http.get<AuthResponse>(`${this.userApiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  editProfile(data: { username: string; email: string }): Observable<any> {
    return this.http.put(`${this.userApiUrl}/edit`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.userApiUrl}/change-password`, data);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/delete`);
  }

}