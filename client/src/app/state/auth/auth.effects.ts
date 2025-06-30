import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "../../core/services/api/auth/auth-api.service";
import { UserApiService } from "../../core/services/api/user/user-api.service";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";


@Injectable({ providedIn: 'root' })

export class AuthEffects {
    private authApiService = inject(AuthApiService);
    private userApiService = inject(UserApiService);
    private authStore = inject(AuthStore);
    private router = inject(Router);
    private snackbar = inject(SnackbarService);

    async login(email: string, password: string): Promise<void> {
        this.authStore.setLoading();

        try {
            const response = await firstValueFrom(this.authApiService.login({ email, password }));

            this.authStore.setAuthData(response.user, response.token);
            this.snackbar.showSuccess(`Welcome back,${response.user.username || 'User'}!`);
            this.router.navigate(['']);

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Login failed. Please check your credentials.';
            this.authStore.setError(errorMessage)
            this.snackbar.showError(errorMessage);
        }
    }

    async register(username: string, email: string, password: string): Promise<void> {
        this.authStore.setLoading();
        try {
            const response = await firstValueFrom(this.authApiService.register({ username, email, password }));

            this.authStore.setAuthData(response.user, response.token);
            this.snackbar.showSuccess(`Account created successfully! Welcome, ${response.user.username || 'User'}.`);
            this.router.navigate([''])

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Registration failed. Please try again.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }

    async checkAuthStatus(): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (!token) {
            this.authStore.clearAuth();
            return false;
        }

        try {
            const response = await firstValueFrom(this.userApiService.getProfile());
            this.authStore.setUser(response.user);
            if (response.stats) {
                this.authStore.setStats(response.stats);
            }
            return true;

        } catch (error) {
            this.logout();
            return false;
        }
    }

    logout() {
        this.authStore.clearAuth();
        this.snackbar.showInfo('You have been logged out.');
        this.router.navigate(['/auth/sign-in'])
    }
}