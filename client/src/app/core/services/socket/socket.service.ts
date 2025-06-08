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
      this.urlStore.updateUrl({ _id: updated.id, clicks: updated.clicks } as UrlEntry);
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