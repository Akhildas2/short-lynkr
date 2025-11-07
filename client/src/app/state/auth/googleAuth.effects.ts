import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "../../core/services/api/auth/auth-api.service";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";
import { getTokenKey, setActiveRole } from "../../shared/utils/auth-storage.util";
import { environment } from "../../../environments/environment";

declare const google: any;

@Injectable({ providedIn: 'root' })

export class GoogleAuthEffects {
    private authApiService = inject(AuthApiService);
    private authStore = inject(AuthStore);
    private router = inject(Router);
    private snackbar = inject(SnackbarService);

    private googleScriptLoaded = false;
    private googleInitialized = false;

    constructor() {
        this.initializeGoogleAuth();
    }


    // Initialize Google Identity Services
    private async initializeGoogleAuth(): Promise<void> {
        if (this.googleInitialized) return;

        try {
            await this.loadGoogleScript();
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: environment.GOOGLE_CLIENT_ID,
                    callback: () => { }, // Placeholder callback
                    cancel_on_tap_outside: true,
                });
                this.googleInitialized = true;
            }
        } catch (error) {
            this.snackbar.showError('Failed to initialize Google Auth');
        }
    }


    // Load Google Identity Services script
    private loadGoogleScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.googleScriptLoaded) {
                resolve();
                return;
            }

            if (typeof google !== 'undefined' && google.accounts) {
                this.googleScriptLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.googleScriptLoaded = true;
                resolve();
            };
            script.onerror = (error) => {
                reject(error);
            };
            document.head.appendChild(script);
        });
    }


    async googleRegister(): Promise<void> {
        this.authStore.setLoading();

        try {
            await this.handleGoogleAuth('register');
        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Google registration failed. Please try again.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }


    async googleLogin(): Promise<void> {
        this.authStore.setLoading();

        try {
            await this.handleGoogleAuth('login');
        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Google login failed. Please try again.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    private async handleGoogleAuth(mode: 'register' | 'login'): Promise<void> {
        // Ensure Google SDK is loaded
        await this.loadGoogleScript();

        if (typeof google === 'undefined' || !google.accounts) {
            this.snackbar.showError('Google authentication not available. Please refresh the page.');
            throw new Error('Google SDK not loaded');
        }

        return new Promise((resolve, reject) => {
            let isResolved = false;
            const callback = async (response: any) => {
                if (isResolved) return;
                isResolved = true;
                try {
                    if (!response?.credential) throw new Error('No credential received from Google');

                    const result = await firstValueFrom(
                        this.authApiService.googleAuth(response.credential, mode)
                    );

                    if (!result.isActive) {
                        this.snackbar.showInfo(result.message || 'Your account is pending approval.');
                        this.router.navigate(['/auth/sign-in']);
                        return resolve();
                    }

                    const { user, token } = result;
                    if (!user || !token) throw new Error('Invalid response from server');

                    const role = user.role;
                    localStorage.setItem(getTokenKey(role), token);
                    setActiveRole(role);
                    this.authStore.setAuthData(user, token);

                    const actionText = mode === 'register' ? 'registered' : 'logged in';
                    this.snackbar.showSuccess(`Successfully ${actionText} with Google!`);
                    this.redirectBasedOnRole(role);

                    resolve();
                } catch (err: any) {
                    const errorMsg = err?.error?.message || err?.message || 'Google authentication failed.';
                    this.snackbar.showError(errorMsg);
                    reject(err);
                }
            };

            google.accounts.id.initialize({
                client_id: environment.GOOGLE_CLIENT_ID,
                callback,
                cancel_on_tap_outside: false,
                ux_mode: 'popup',
                context: mode === 'register' ? 'signup' : 'signin',
            });

            google.accounts.id.prompt((notification: any) => {
                if (isResolved) return;

                // Handle all notification states properly
                if (notification.isNotDisplayed()) {
                    // One Tap not displayed (could be cooldown, browser settings, etc.)
                    this.showGooglePopup(mode, callback, resolve, reject);
                } else if (notification.isSkippedMoment()) {
                    // User dismissed One Tap - show popup as fallback
                    this.showGooglePopup(mode, callback, resolve, reject);
                } else if (notification.isDismissedMoment()) {
                    // User explicitly dismissed One Tap
                    this.showGooglePopup(mode, callback, resolve, reject);
                }
            });

            setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    reject(new Error('Google sign-in timed out. Please try again.'));
                }
            }, 30000);  // 30 second timeout
        });
    }

    private showGooglePopup(
        mode: 'register' | 'login',
        callback: (response: any) => void,
        resolve: () => void,
        reject: (error: any) => void,
    ): void {
        let container: HTMLElement | null = null;

        try {
            // Create a temporary container
            container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.visibility = 'hidden';
            container.style.pointerEvents = 'none';
            document.body.appendChild(container);

            // Reinitialize for popup mode with the same callback
            google.accounts.id.initialize({
                client_id: environment.GOOGLE_CLIENT_ID,
                callback: callback,
                cancel_on_tap_outside: false,
                ux_mode: 'popup',
                context: mode === 'register' ? 'signup' : 'signin',
            });

            // Render the button
            google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: mode === 'register' ? 'signup_with' : 'signin_with',
                width: 400,
                logo_alignment: 'left'
            });

            // Auto-click the button to trigger popup
            setTimeout(() => {
                const button = container?.querySelector('div[role="button"]') as HTMLElement;
                if (button) {
                    button.click();

                    // Clean up container after popup opens
                    setTimeout(() => {
                        if (container && document.body.contains(container)) {
                            document.body.removeChild(container);
                            container = null;
                        }
                    }, 1000);
                } else {
                    if (container && document.body.contains(container)) {
                        document.body.removeChild(container);
                    }
                    this.snackbar.showError('Failed to open Google sign-in. Please try again.');
                    reject(new Error('Button not found'));
                }
            }, 100);

        } catch (error) {
            if (container && document.body.contains(container)) {
                document.body.removeChild(container);
            }
            this.snackbar.showError('Failed to initialize Google sign-in popup.');
            reject(error);
        }
    }


    private redirectBasedOnRole(role: string) {
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'user') this.router.navigate(['/']);
        else this.router.navigate(['/auth/sign-in']);
    }

}