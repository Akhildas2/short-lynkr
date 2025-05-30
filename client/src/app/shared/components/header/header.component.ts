import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../Material.Module';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { authEffects } from '../../../state/auth/auth.effects';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../state/auth/auth.store';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, ThemeToggleComponent, CommonModule, RouterLink, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authEffects = inject(authEffects);
  private authStore = inject(AuthStore);
  mobileMenuOpen: boolean = false;
  mobileDropdownOpen: boolean = false;
  isMobile: boolean = false;

  constructor() {
    this.authEffects.checkAuthStatus();
  }

  get user(): boolean {
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

  ngOnInit(): void {
    window.addEventListener('resize', this.updateScreenSize);
    this.updateScreenSize();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateScreenSize)
  }

  private updateScreenSize = () => {
    this.isMobile = window.innerWidth < 480;
  }

  toggleMobileDropdown() {
    if (this.isMobile) {
      this.mobileDropdownOpen = !this.mobileDropdownOpen
    }
  }
}
