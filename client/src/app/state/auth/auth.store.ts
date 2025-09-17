import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthUser, ProfileStats } from '../../models/auth/auth.model';
import { initialState } from '../../models/auth/auth-state.model';

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ user, token, stats }) => ({
        isAuthenticated: computed(() => !!user() && !!token()),
        username: computed(() => user()?.username || ''),
        userRole: computed(() => user()?.role || ''),
        profileStats: computed(() => stats())
    })),
    withMethods((store) => ({
        setUser(user: AuthUser) {
            patchState(store, { user, status: 'success', error: null });
        },
        setToken(token: string) {
            patchState(store, { token });
        },
        setAuthData(user: AuthUser, token: string) {
            patchState(store, { user, token, status: 'success', error: null });
        },
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setStats(stats: ProfileStats) {
            patchState(store, { stats });
        },
        setError(errorMessage: string) {
            patchState(store, { status: 'error', error: errorMessage });
        },
        clearAuth() {
            patchState(store, { user: null, token: null, status: 'idle', error: null, stats: null });
        }
    }))
);