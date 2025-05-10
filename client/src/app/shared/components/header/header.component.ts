import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../Material.Module';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { authEffects } from '../../../state/auth/auth.effects';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../state/auth/auth.store';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, ThemeToggleComponent, CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  mobileMenuOpen: boolean = false;

  private authStore = inject(AuthStore);

  constructor(private authEffects: authEffects) {
    this.authEffects.checkAuthStatus();
  }

  get isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  get username(): string {
    return this.authStore.username();
  }

  logout() {
    this.authEffects.logout();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

}
