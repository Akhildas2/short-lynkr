import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlEntry } from '../../../../models/url/url.model';

@Injectable({ providedIn: 'root' })
export class UrlService {
  private apiUrl = environment.apiUrl;
  private baseApi = environment.baseApi;

  constructor(private http: HttpClient) { }

  createUrl(originalUrl: string, expiryDays?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { originalUrl, expiryDays });
  }

  getUserUrls(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-urls`);
  }

  getUrlById(id: string): Observable<{ url: UrlEntry }> {
    return this.http.get<{ url: UrlEntry }>(`${this.apiUrl}/${id}`);
  }

  redirectToOriginal(shortId: string): Observable<any> {
    return this.http.get(`${this.baseApi}/r/${shortId}`)
  }

  deleteUrl(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
