import { effect, inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../../../models/notification/notification.interface';
import { AuthStore } from '../../../../state/auth/auth.store';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private authStore = inject(AuthStore);
  private socket: Socket;
  private notificationSubject = new Subject<Notification>();

  constructor(private http: HttpClient) {
    this.socket = io(environment.baseApiUrl, {
      transports: ['websocket']
    });

    effect(() => {
      const user = this.authStore.user();
      const role = this.authStore.userRole();

      if (!user || !role) return;
      if (!this.socket.connected) return;

      this.socket.emit('join', {
        userId: user._id,
        role
      });

    });

    this.listenToSocket();
  }

  private listenToSocket(): void {
    this.socket.on('newNotification', (data: Notification) => {
      this.notificationSubject.next(data);
    });
    this.socket.on('notificationUpdated', (data: Notification) => {
      this.notificationSubject.next(data);
    });
    this.socket.on('notificationDeleted', (id: string) => {
      this.notificationSubject.next({ _id: id } as Notification);
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {});
  }

  toggleReadStatus(ids: string[], read: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle-read`, { ids, read });
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteMultipleNotifications(ids: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-multiple`, { ids });
  }

  createNotification(data: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, data);
  }

  onNotification(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }
}
