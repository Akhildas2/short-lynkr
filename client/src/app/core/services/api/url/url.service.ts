import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlEntry } from '../../../../models/url/url.model';

@Injectable({ providedIn: 'root' })
export class UrlService {
  private urlApiUrl = environment.urlApiUrl;

  constructor(private http: HttpClient) { }

  createUrl(data: { originalUrl: string; expiryDays: number; customCode: string; clickLimit: number; tags: string[] }): Observable<any> {
    return this.http.post(`${this.urlApiUrl}/create`, data);
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

  deleteUrl(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlApiUrl}/${id}`)
  }

  getQrUrl(id: string, size: number, format: string): Observable<Blob> {
    return this.http.get(`${this.urlApiUrl}/qr/${id}?size=${size}&format=${format}`, {
      responseType: 'blob'
    });
  }

}