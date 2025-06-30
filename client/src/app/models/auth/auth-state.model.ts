import { AuthUser, ProfileStats } from "./auth.model";

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    stats: ProfileStats | null;
}

export const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    status: 'idle',
    error: null,
    stats: null
};