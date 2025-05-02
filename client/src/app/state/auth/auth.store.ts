import { Injectable, signal, computed } from '@angular/core';
import { AuthUser } from '../../models/auth.model';


@Injectable({ providedIn: 'root' })
export class AuthStore {
    private readonly _user = signal<AuthUser | null>(null);
    readonly user = computed(() => this._user());
    readonly isAuthenticated = computed(() => !!this._user());

    setUser(user: AuthUser) {
        this._user.set(user);
    }

    clearUser() {
        this._user.set(null);
    }
}
