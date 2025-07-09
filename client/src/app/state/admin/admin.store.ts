import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialState, User } from '../../models/user/user.model';
import { UrlEntry } from '../../models/url/url.model';

export const AdminStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        //  Loading & Error
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(error: string) {
            patchState(store, { status: 'error', error });
        },
        setSuccess() {
            patchState(store, { status: 'success', error: null });
        },
        //  User Management
        setUsers(users: User[]) {
            patchState(store, { users, status: 'success', error: null });
        },
        addUser(user: User) {
            patchState(store, {
                users: [user, ...store.users()],
                status: 'success',
                error: null
            });
        },
        updateUser(updated: User) {
            const updatedUsers = store.users().map(u =>
                u._id === updated._id ? updated : u
            );
            patchState(store, { users: updatedUsers, selectedUser: updated });
        },
        removeUser(id: string) {
            const filtered = store.users().filter(u => u._id !== id);
            patchState(store, { users: filtered });
        },
        setSelectedUser(user: User | null) {
            patchState(store, { selectedUser: user });
        },

        // URL Management
        setUrls(urls: UrlEntry[]) {
            patchState(store, { urls, status: 'success', error: null });
        },
        updateUrl(updated: UrlEntry) {
            const updatedUrls = store.urls().map(url =>
                url._id === updated._id ? updated : url
            );
            patchState(store, { urls: updatedUrls, selectedUrl: updated });
        },
        removeUrl(id: string) {
            const filtered = store.urls().filter(url => url._id !== id);
            patchState(store, { urls: filtered });
        },
        setSelectedUrl(url: UrlEntry | null) {
            patchState(store, { selectedUrl: url });
        },

        // Reset
        clearAdminState() {
            patchState(store, initialState);
        }
    }))
);
