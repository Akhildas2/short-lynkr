import { AdminState } from "./user-state.model";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isBlocked: boolean;
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