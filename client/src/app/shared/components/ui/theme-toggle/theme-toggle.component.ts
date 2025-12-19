import { Component, Input, OnInit } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { MaterialModule } from '../../../../../Material.Module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  imports: [MaterialModule, CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent implements OnInit {
  @Input() mode: 'adminMode' | 'userMode' = 'userMode';
  isDark = false;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    // initialize theme based on module
    this.themeService.initTheme(this.mode);

    // subscribe to changes
    this.themeService.isDarkTheme$.subscribe(dark => this.isDark = dark);
  }

  toggleTheme() {
    this.themeService.toggleTheme(this.mode);
  }
}
