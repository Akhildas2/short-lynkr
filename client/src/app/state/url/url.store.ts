import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { initialState } from "../../models/auth/auth-state.model";
import { computed } from "@angular/core";


export const UrlStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((state) => ({
      
    })),
    withMethods((store) => ({
        setLoading() {
            patchState(store, { status: 'loading', error: null });
        },
        setError(error: string) {
            patchState(store, { status: 'error', error });
        },
        setUrl(){

        },
        clearError(){
            patchState(store,{error:null});
        },
        clearSelection(){
            patchState(store,{});
        }
       
    }))

)