import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UrlService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createUrl(originalUrl: string, expiryDays?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { originalUrl, expiryDays });
  }

  getUserUrls(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-urls`);
  }

  redirectToOriginal(shortId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/r/${shortId}`)
  }

  deleteUrl(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
