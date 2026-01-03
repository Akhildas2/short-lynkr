export interface AuthUser {
    _id: string;
    username?: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    isBlocked?: boolean;
    isEmailVerified?: boolean;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
    stats?: ProfileStats;
    message?: string;
    requireEmailVerification?: boolean;
    isActive?: boolean;
}

export interface ProfileStats {
    totalUrls: number;
    totalClicks: number;
    uniqueVisitors: number;
}