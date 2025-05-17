import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { MaterialModule } from '../../../../Material.Module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  imports: [MaterialModule, CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  isDark = false;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkTheme$.subscribe(dark => this.isDark = dark);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
