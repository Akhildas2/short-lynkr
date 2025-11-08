import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { SharedModule } from '../../../shared.module';
export interface ErrorConfig {
  code: string;
  title: string;
  message: string;
  lightGif: string;
  darkGif: string;
  numbers: string[];
}

@Component({
  selector: 'app-error-page',
  imports: [ThemeToggleComponent, SharedModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  @Input() errorConfig: ErrorConfig = {
    code: '404',
    title: 'Oops! Page Not Found',
    message: 'The page you are looking for doesn\'t exist or has been moved.',
    lightGif: 'assets/404 (1).gif',
    darkGif: 'assets/404 (2).gif',
    numbers: ['4', '0', '4']
  };

  constructor(private router: Router) { }

  goHome() {
    this.router.navigate(['/']);
  }

  getNumberArray(): string[] {
    // Create array with repeated numbers for animation
    const baseNumbers = this.errorConfig.numbers;
    const result: string[] = [];

    // Add regular numbers (8 total)
    for (let i = 0; i < 8; i++) {
      result.push(baseNumbers[i % baseNumbers.length]);
    }

    // Add numbers with shadow (4 total)
    for (let i = 0; i < 4; i++) {
      result.push(baseNumbers[i % baseNumbers.length]);
    }

    return result;
  }

  isWithShadow(index: number): boolean {
    return index >= 8; // Last 4 numbers have shadow
  }
}