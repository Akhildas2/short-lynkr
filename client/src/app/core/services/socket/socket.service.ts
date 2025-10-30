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

    this.socket.on('urlUpdated', (updatedUrl: UrlEntry) => {
      // Update selected URL if it matches
      const currentSelectedUrl = this.urlStore.selectedUrl();
      if (currentSelectedUrl && currentSelectedUrl._id === updatedUrl._id) {
        this.urlStore.setSelectedUrl(updatedUrl);
      }

      // Update URLs list
      const currentUrls = this.urlStore.urls();
      if (currentUrls && currentUrls.length > 0) {
        const existing = currentUrls.find(u => u._id === updatedUrl._id);
        if (existing) {
          this.urlStore.updateUrl(updatedUrl);
        }
      }
    });

    this.socket.on('urlCreated', (urlData: UrlEntry) => {
      const currentUrls = this.urlStore.urls();
      const alreadyExists = currentUrls.some(u => u._id === urlData._id);
      if (!alreadyExists) {
        this.urlStore.addUrl(urlData);
      }
    });

    this.listenersRegistered = true;
  }

  constructor() {
    this.socket = io(environment.baseApiUrl);
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