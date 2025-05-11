import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createUrl(longUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { longUrl });
  }

  getUserUrls(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-urls`);
  }

  redirectToOriginal(shortId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${shortId}`)
  }
}
