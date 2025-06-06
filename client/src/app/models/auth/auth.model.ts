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