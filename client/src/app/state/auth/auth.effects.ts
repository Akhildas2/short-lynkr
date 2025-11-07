import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "../../core/services/api/auth/auth-api.service";
import { UserApiService } from "../../core/services/api/user/user-api.service";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";
import { clearActiveRole, getActiveRole, getTokenKey, setActiveRole } from "../../shared/utils/auth-storage.util";

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
            const { user, token } = response;
            const role = user.role;

            // Save token per role
            localStorage.setItem(getTokenKey(role), token);
            setActiveRole(role);

            this.authStore.setAuthData(user, token);
            this.snackbar.showSuccess(`Welcome back,${response.user.username || 'User'}!`);
            this.redirectBasedOnRole(role);

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

            //  Verification required
            if (response.requireEmailVerification) {
                this.snackbar.showInfo(response.message || 'Please verify your email.');
                this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
                return;
            }

            if (!response.isActive) {
                this.snackbar.showInfo(response.message || 'Your account is pending admin approval.');
                this.router.navigate(['/auth/login']);
                return;
            }

            // No verification required
            const { user, token } = response;
            const role = user.role;

            // Save token per role
            localStorage.setItem(getTokenKey(role), token);
            setActiveRole(role);

            this.authStore.setAuthData(user, token);
            this.snackbar.showSuccess(`Account created successfully! Welcome, ${response.user.username || 'User'}.`);
            this.redirectBasedOnRole(role);

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Registration failed. Please try again.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }


    async verifyEmail(email: string, otp: string): Promise<void> {
        this.authStore.setLoading();
        try {
            const response = await firstValueFrom(this.authApiService.verifyEmail({ email, otp }));

            if (!response.isActive) {
                this.snackbar.showInfo(response.message || 'Your account is pending admin approval.');
                this.router.navigate(['/auth/login']);
                return;
            }

            //  Ensure user & token exist
            if (response.user && response.token) {
                const { user, token } = response;
                const role = user.role;

                localStorage.setItem(getTokenKey(role), token);
                setActiveRole(role);

                this.authStore.setAuthData(user, token);
                this.snackbar.showSuccess(`Email verified successfully! Welcome, ${user.username || 'User'}.`);
                this.redirectBasedOnRole(role);
            } else {
                this.snackbar.showInfo(response.message || 'Verification successful. Please login.');
                this.router.navigate(['/auth/sign-in']);
            }

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Email verification failed.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }


    async resendOtp(email: string): Promise<void> {
        this.authStore.setLoading();

        try {
            const response = await firstValueFrom(this.authApiService.resendOtp(email));
            this.snackbar.showSuccess(response.message || 'A new OTP has been sent.');

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to resend OTP.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }


    async forgotPassword(email: string): Promise<void> {
        this.authStore.setLoading();
        try {
            const response = await firstValueFrom(this.authApiService.forgotPassword(email));
            this.snackbar.showSuccess(response.message || 'OTP sent to your email.');
            this.router.navigate(['/auth/reset-password'], { queryParams: { email } });

        } catch (error: any) {
            const errorMessage = error?.error?.message || 'Email verification failed.';
            this.authStore.setError(errorMessage);
            this.snackbar.showError(errorMessage);
        }
    }


    async logout() {
        const activeRole = getActiveRole();
        if (activeRole) {
            localStorage.removeItem(getTokenKey(activeRole));
            clearActiveRole();
        }
        this.authStore.clearAuth();
        this.snackbar.showInfo('You have been logged out.');
        this.router.navigate(['/auth/sign-in'])
    }


    async editProfile(username: string, email: string): Promise<void> {
        try {
            const response = await firstValueFrom(this.userApiService.editProfile({ username, email }));
            this.authStore.setUser(response.user);
            this.snackbar.showSuccess('Profile updated successfully.');

        } catch (error: any) {
            const errorMessage = error?.error.message || 'Update failed.';
            this.authStore.setError(errorMessage)
            this.snackbar.showError(errorMessage);
        }
    }


    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        try {
            const response = await firstValueFrom(this.userApiService.changePassword({ currentPassword, newPassword }));
            this.snackbar.showSuccess(response.message)

        } catch (error: any) {
            const errorMessage = error?.error.message || 'Password change failed.';
            this.authStore.setError(errorMessage)
            this.snackbar.showError(errorMessage);
        }
    }


    async deleteAccount(): Promise<void> {
        try {
            const response = await firstValueFrom(this.userApiService.deleteAccount());
            this.snackbar.showSuccess(response.message);
            await this.logout();

        } catch (error: any) {
            const errorMessage = error?.error.message || 'Account deletion failed.';
            this.authStore.setError(errorMessage)
            this.snackbar.showError(errorMessage);
        }
    }

    async checkAuthStatus(): Promise<boolean> {
        const role = getActiveRole();
        if (!role) {
            this.authStore.clearAuth();
            return false;
        }

        const token = localStorage.getItem(getTokenKey(role));
        if (!token) {
            this.authStore.clearAuth();
            return false;
        }

        this.authStore.setToken(token);
        try {
            const response = await firstValueFrom(this.userApiService.getProfile());
            this.authStore.setUser(response.user);
            if (response.stats) {
                this.authStore.setStats(response.stats);
            }
            // Ensure the role from the validated profile matches the one in storage
            if (response.user.role !== role) {
                await this.logout();
                return false;
            }
            return true;

        } catch (error) {
            await this.logout();
            return false;
        }
    }


    async fetchOtpRemainingTime(email: string): Promise<number> {
        try {
            const response = await firstValueFrom(this.authApiService.getOtpRemainingTime(email));
            return response.remaining;
        } catch {
            return 0;
        }
    }

    private redirectBasedOnRole(role: string) {
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'user') this.router.navigate(['/']);
        else this.router.navigate(['/auth/sign-in']);
    }

}