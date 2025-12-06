import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { SocialQrEntry } from '../../../../models/qr/socialQr.interface';

@Injectable({
  providedIn: 'root'
})
export class SocialQrService {

  private apiUrl = `${environment.apiUrl}/social-qr`;

  constructor(private http: HttpClient) { }

  // Create a new social QR
  createSocialQr(data: {
    platform: string;
    accountUrl: string;
    size?: number;
    format?: 'PNG' | 'JPEG' | 'SVG';
    foregroundColor?: string;
    backgroundColor?: string;
  }): Observable<SocialQrEntry> {
    return this.http.post<SocialQrEntry>(`${this.apiUrl}/create`, data);
  }

  // Update an existing QR by ID
  updateSocialQr(id: string, data: Partial<{
    platform: string;
    accountUrl: string;
    size: number;
    format: 'PNG' | 'JPEG' | 'SVG';
    foregroundColor: string;
    backgroundColor: string;
  }>): Observable<SocialQrEntry> {
    return this.http.put<SocialQrEntry>(`${this.apiUrl}/update/${id}`, data);
  }

  // Get all QR codes of the authenticated user
  getSocialQr(): Observable<SocialQrEntry[]> {
    return this.http.get<SocialQrEntry[]>(`${this.apiUrl}/my-qr`);
  }

  // Get a QR by ID
  getSocialQrById(id: string): Observable<SocialQrEntry> {
    return this.http.get<SocialQrEntry>(`${this.apiUrl}/${id}`);
  }

  // Delete a QR by ID
  deleteSocialQr(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}