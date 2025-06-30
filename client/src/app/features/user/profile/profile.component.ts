import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/ui/header/header.component';
import { FooterComponent } from '../../../shared/components/ui/footer/footer.component';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { AuthStore } from '../../../state/auth/auth.store';
import { SharedModule } from '../../../shared/shared.module';

@Component({
    selector: 'app-profile',
    imports: [HeaderComponent, FooterComponent, SharedModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    private authStore = inject(AuthStore);

    constructor(private authEffect: AuthEffects) {
        this.authEffect.checkAuthStatus();
    }

    readonly user = this.authStore.user;
    readonly isAuthenticated = this.authStore.isAuthenticated;
    readonly stats = this.authStore.profileStats;

    logout(): void {
        return this.authEffect.logout();
    }

}
