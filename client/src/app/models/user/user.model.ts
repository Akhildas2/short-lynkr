import { AdminState } from "./user-state.model";

export interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    isBlocked: boolean;
    password: string;
    createdAt?: string;
    updatedAt?: string;
}

export const initialState: AdminState = {
    status: 'idle',
    error: null,
    users: [],
    urls: [],
    selectedUser: null,
    selectedUrl: null
};