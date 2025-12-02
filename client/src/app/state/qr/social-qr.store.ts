import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { initialState } from '../../models/qr/qr-state.model';
import { SocialQrEntry } from '../../models/qr/socialQr.interface';

export const SocialQrStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(error: string) {
            patchState(store, { status: 'error', error });
        },
        setSocialQrs(qrs: SocialQrEntry[]) {
            patchState(store, { socialQrs: qrs, status: 'success', error: null });
        },
        addSocialQr(qr: SocialQrEntry) {
            patchState(store, { socialQrs: [qr, ...store.socialQrs()], status: 'success', error: null });
        },
        updateSocialQr(updatedQr: SocialQrEntry) {
            const current = store.socialQrs();
            patchState(store, {
                socialQrs: current.map(q => q._id === updatedQr._id ? updatedQr : q),
                selectedQr: updatedQr,
                status: 'success',
                error: null
            });
        },
        removeSocialQr(id: string) {
            const current = store.socialQrs();
            patchState(store, { socialQrs: current.filter(q => q._id !== id), status: 'success', error: null });
        },
        clearSocialQrs() {
            patchState(store, { socialQrs: [], status: 'idle', error: null });
        },
        setSelectedQr(qr: SocialQrEntry) {
            patchState(store, { selectedQr: qr, status: 'success', error: null });
        },
        clearSelectedQr() {
            patchState(store, { selectedQr: null });
        }
    }))
    
);