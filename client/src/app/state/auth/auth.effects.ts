import { Injectable } from "@angular/core";
import { AuthApiService } from "../../core/services/api/auth/auth-api.service";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";


@Injectable({ providedIn: 'root' })

export class authEffects {
    constructor(private authApi: AuthApiService, private authStore: AuthStore, private router: Router) { }

    async login(email: string, password: string) {
        try {
            const response = await this.authApi.login({ email, password }).toPromise();
            if (!response) throw new Error('No response received');
            this.authStore.setUser(response.user);
            localStorage.setItem('token', response.token);
            this.router.navigate(['/home']);
        } catch (error) {
            console.error('Login failed', error);
        }
    }

    async register(username: string, email: string, password: string) {
        try {
            const response = await this.authApi.register({ username, email, password }).toPromise();
            if (!response) throw new Error('No response received');
            this.authStore.setUser(response.user);
            localStorage.setItem('token', response.token);
            this.router.navigate(['/home'])
        } catch (error) {
            console.error('Registration failed', error);
        }
    }

    logout() {
        this.authStore.clearUser();
        localStorage.removeItem('token');
        this.router.navigate(['/auth/login'])
    }
}