import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../models/user/user.model';
import { Observable } from 'rxjs';
import { UrlEntry } from '../../../../models/url/url.model';
import { AdminAnalytics } from '../../../../models/analytic/adminAnalytics.interface';
import { AdminSettings } from '../../../../models/settings/adminSettings.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private adminApi = environment.adminApiUrl;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminApi}/users`);
  }

  addUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.adminApi}/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.adminApi}/users/${id}`, user);
  }

  toggleBlockUser(id: string, isBlocked: boolean): Observable<any> {
    return this.http.patch(`${this.adminApi}/users/${id}/block`, { isBlocked });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.adminApi}/users/${id}`);
  }

  getAllUrls(): Observable<UrlEntry[]> {
    return this.http.get<UrlEntry[]>(`${this.adminApi}/urls`);
  }

  toggleBlockUrl(id: string, isBlocked: boolean): Observable<UrlEntry> {
    return this.http.patch<UrlEntry>(`${this.adminApi}/urls/${id}/block`, { isBlocked });
  }

  deleteUrl(id: string): Observable<any> {
    return this.http.delete(`${this.adminApi}/urls/${id}`);
  }

  getAdminAnalytics(range: string): Observable<AdminAnalytics> {
    return this.http.get<AdminAnalytics>(`${this.adminApi}/analytics`, { params: { range } });
  }

  getAdminDashboard(range: string): Observable<any> {
    return this.http.get<any>(`${this.adminApi}/dashboard`, { params: { range } })
  }

  // Settings methods
  getSettings(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(`${this.adminApi}/settings`);
  }

  updateSettings(settings: Partial<AdminSettings>): Observable<AdminSettings> {
    return this.http.patch<AdminSettings>(`${this.adminApi}/settings`, settings);
  }

  resetSettings(section?: string): Observable<AdminSettings> {
    const body = section ? { section } : {};
    return this.http.post<AdminSettings>(`${this.adminApi}/settings/reset`, body);
  }

}