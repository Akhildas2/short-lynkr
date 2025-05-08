import { Injectable } from "@angular/core";
import { AuthApiService } from "../../core/services/api/auth/auth-api.service";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { SnackbarService } from "../../shared/services/snackbar/snackbar.service";
import { firstValueFrom } from "rxjs";


@Injectable({ providedIn: 'root' })

export class authEffects {
    constructor(private authApiService: AuthApiService, private authStore: AuthStore, private router: Router,private snackbar:SnackbarService) { }

    async login(email: string, password: string):Promise<void> {
        try {
            const response = await firstValueFrom(this.authApiService.login({ email, password }));
            this.authStore.setUser(response.user);
            localStorage.setItem('token', response.token);
            this.snackbar.showSuccess(`Welcome back, ${response.user.username}!`);
            this.router.navigate(['']);
        } catch (error:any) {
            this.snackbar.showError(error?.error?.message || 'Login failed. Please check your credentials.');
        }
    }

    async register(username: string, email: string, password: string):Promise<void> {
        try {
            const response = await firstValueFrom(this.authApiService.register({ username, email, password }));
            this.authStore.setUser(response.user);
            localStorage.setItem('token', response.token);
            this.snackbar.showSuccess(`Account created successfully! Welcome, ${response.user.username}.`);
            this.router.navigate([''])
        } catch (error:any) {
            this.snackbar.showError(error?.error?.message || 'Registration failed. Please try again.');
        }
    }

    logout() {
        this.authStore.clearUser();
        localStorage.removeItem('token');
        this.snackbar.showInfo('You have been logged out.');
        this.router.navigate(['/auth/login'])
    }
}