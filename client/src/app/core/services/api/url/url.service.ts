import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlEntry } from '../../../../models/url/url.model';

@Injectable({ providedIn: 'root' })
export class UrlService {
  private urlApiUrl = environment.urlApiUrl;
  private baseApiUrl = environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  createUrl(originalUrl: string): Observable<any> {
    return this.http.post(`${this.urlApiUrl}/create`, { originalUrl });
  }

  updateUrl(id: string, data: { expiryDays?: number; customCode?: string; clickLimit?: number, tags?: string[] }): Observable<{ url: UrlEntry }> {
    return this.http.patch<{ url: UrlEntry }>(`${this.urlApiUrl}/update/${id}`, data)
  }

  getUserUrls(): Observable<any> {
    return this.http.get(`${this.urlApiUrl}/my-urls`);
  }

  getUrlById(id: string, range?: string): Observable<{ url: UrlEntry }> {
    return this.http.get<{ url: UrlEntry }>(`${this.urlApiUrl}/${id}?range=${range}`);
  }

  redirectToOriginal(shortId: string): Observable<any> {
    return this.http.get(`${this.baseApiUrl}/r/${shortId}`, { observe: 'response' })
  }

  deleteUrl(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlApiUrl}/${id}`)
  }

}