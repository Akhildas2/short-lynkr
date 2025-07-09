import { UrlEntry } from "../url/url.model";
import { User } from "./user.model";

export interface AdminState {
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    users: User[];
    urls: UrlEntry[];
    
    selectedUser: User | null;
    selectedUrl: UrlEntry | null;
}