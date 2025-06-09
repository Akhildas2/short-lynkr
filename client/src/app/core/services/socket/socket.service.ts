import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { UrlStore } from '../../../state/url/url.store';
import { UrlEntry } from '../../../models/url/url.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private urlStore = inject(UrlStore);
  private listenersRegistered = false;

  private registerListeners() {
    if (this.listenersRegistered) return;

    this.socket.on('urlUpdated', (updated: { id: string; clicks: number }) => {

      const currentSelectedUrl = this.urlStore.selectedUrl();

      if (currentSelectedUrl && currentSelectedUrl._id === updated.id) {
        this.urlStore.setSelectedUrl({
          ...currentSelectedUrl,
          clicks: updated.clicks
        });
      }

      const currentUrls = this.urlStore.urls();
      if (currentUrls && currentUrls.length > 0) {
        const existing = this.urlStore.urls().find(u => u._id === updated.id);
        if (existing) {
          this.urlStore.updateUrl({
            ...existing,
            clicks: updated.clicks
          });
        }
      }
    });

    this.listenersRegistered = true;
  }

  constructor() {
    this.socket = io(environment.baseApi);
    this.registerListeners();
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

}