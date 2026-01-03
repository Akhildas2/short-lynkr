import { Injectable, effect, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthStore } from '../../../state/auth/auth.store';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment';
import { AuthEffects } from '../../../state/auth/auth.effects';

@Injectable({ providedIn: 'root' })
export class AuthSocketService {
    private socket: Socket;

    private authStore = inject(AuthStore);
    private authEffects = inject(AuthEffects);
    private snackbar = inject(SnackbarService);

    constructor() {
        this.socket = io(environment.baseApiUrl, {
            transports: ['websocket'],
            autoConnect: true
        });

        // Join user room when auth changes
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

        this.listen();
    }

    private listen() {
        this.socket.on('blocked', async () => {
            this.snackbar.showError(
                'Your account has been blocked by admin.'
            );
            await this.authEffects.logout();
        });
    }

}