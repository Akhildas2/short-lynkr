import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { initialState } from "../../models/url/url-state.model";
import { UrlEntry } from "../../models/url/url.model";


export const UrlStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(error: string) {
            patchState(store, { status: 'error', error });
        },
        setUrl(urls: UrlEntry[]) {
            patchState(store, { urls, status: 'success', error: null });
        },
        addUrl(url: UrlEntry) {
            patchState(store, {
                urls: [url, ...store.urls()],
                status: 'success',
                error: null
            });
        },
        removeUrl(id: string) {
            const currentUrls = store.urls();
            patchState(store, {
                urls: currentUrls.filter((url: UrlEntry) => url._id !== id),
                status: 'success',
                error: null
            });
        },
        clearUrls() {
            patchState(store, { urls: [], status: 'idle', error: null });
        },
        setSelectedUrl(url: UrlEntry) {
            patchState(store, {
                selectedUrl: url,
                status: 'success',
                error: null
            });
        },

        clearSelectedUrl() {
            patchState(store, { selectedUrl: null });
        }
    }))

);