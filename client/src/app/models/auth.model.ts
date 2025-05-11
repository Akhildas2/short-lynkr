export interface AuthUser {
    _id: string;
    username?: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

export  const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    status: 'idle',
    error: null
};