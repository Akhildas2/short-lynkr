import { Component, Input } from '@angular/core';
import { ErrorConfig } from '../../../../models/error/errorConfig.interface';
import { Router } from '@angular/router';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-shared-error-layout',
  imports: [ThemeToggleComponent, SharedModule],
  templateUrl: './shared-error-layout.component.html',
  styleUrl: './shared-error-layout.component.scss',
})
export class SharedErrorLayoutComponent {
  @Input() errorConfig: ErrorConfig = {
    code: '404',
    title: 'Oops! Page Not Found',
    message: 'The page you are looking for doesn\'t exist or has been moved.',
    lightGif: 'assets/404-light.gif',
    darkGif: 'assets/404-dark.gif',
    numbers: ['4', '0', '4']
  };

  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  getNumberArray(): string[] {
    let baseNumbers = this.errorConfig.numbers;

    if (this.errorConfig.code === '0') {
      baseNumbers = ['O', 'F', 'F', 'L', 'I', 'N', 'E'];
    }

    const result: string[] = [];
    for (let i = 0; i < 8; i++) result.push(baseNumbers[i % baseNumbers.length]);
    for (let i = 0; i < 4; i++) result.push(baseNumbers[i % baseNumbers.length]);
    return result;
  }

  isWithShadow(index: number): boolean {
    return index >= 8; // Last 4 numbers have shadow
  }

}