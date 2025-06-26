import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthUser } from '../../models/auth/auth.model';
import { initialState } from '../../models/auth/auth-state.model';

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ user, token }) => ({
        user: computed(() => user()),
        isAuthenticated: computed(() => !!user() && !!token()),
        username: computed(() => user()?.username || ''),
        userRole: computed(() => user()?.role || '')
    })),
    withMethods((store) => ({
        setUser(user: AuthUser) {
            patchState(store, { user, status: 'success', error: null });
        },
        setToken(token: string) {
            patchState(store, { token });
            localStorage.setItem('token', token);
        },
        setAuthData(user: AuthUser, token: string) {
            patchState(store, { user, token, status: 'success', error: null });
            localStorage.setItem('token', token);
        },
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(errorMessage: string) {
            patchState(store, { status: 'error', error: errorMessage });
        },
        clearAuth() {
            patchState(store, { user: null, token: null, status: 'idle', error: null });
            localStorage.removeItem('token');
        }
    }))
);