import { Component } from '@angular/core';
import { MaterialModule } from '../../../../Material.Module';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../state/auth/auth.store';
import { authEffects } from '../../../state/auth/auth.effects';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule,ThemeToggleComponent,CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  mobileMenuOpen: boolean = false;
  constructor(private authStore:AuthStore,private authEffects:authEffects){}

  get user(){
    return  this.authStore.user();
  }

  logout(){
    this.authEffects.logout();
  }

  toggleMobileMenu(){
    this.mobileMenuOpen=!this.mobileMenuOpen;
  }

}
