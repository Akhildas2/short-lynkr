import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorConfig } from '../../../models/error/errorConfig.interface';
import { SharedErrorLayoutComponent } from '../../../shared/components/layouts/shared-error-layout/shared-error-layout.component';
import { BackendHealthService } from '../../../core/services/backend-health/backend-health.service';

@Component({
  selector: 'app-error-page',
  imports: [SharedErrorLayoutComponent],
  template: `<app-shared-error-layout [errorConfig]="errorConfig"></app-shared-error-layout>`
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  private intervalId!: number;
  code!: number;
  message!: string;
  errorConfig!: ErrorConfig;

  constructor(private route: ActivatedRoute, private health: BackendHealthService, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.code = parseInt(params['code'], 10);
      if (isNaN(this.code)) this.code = 0;
      this.message = params['message'] || this.getDefaultErrorMessage(this.code);

      this.errorConfig = {
        code: `${this.code}`,
        title: this.getTitle(this.code),
        message: this.message,
        lightGif: this.getGif(this.code, 'light'),
        darkGif: this.getGif(this.code, 'dark'),
        numbers: this.getNumbersArray(this.code)
      };
    });

    // Auto-recover when backend is back
    this.startHealthCheck();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Silent backend recovery check
  private startHealthCheck() {
    this.intervalId = window.setInterval(async () => {
      const isUp = await this.health.checkHealth();

      if (isUp) {
        this.health.markUp();          // backend is alive
        clearInterval(this.intervalId);

        // Prevent double navigation
        if (this.router.url !== '/home') {
          this.router.navigate(['/home']);
        }
      }
    }, 3000);
  }


  // ------------------------
  //  Helper methods
  // ------------------------
  private getTitle(code: number): string {
    switch (code) {
      case 0: return 'Offline';
      case 404: return 'Oops! Not Found';
      case 410: return 'Resource Gone';
      case 429: return 'Too Many Requests';
      case 500: return 'Internal Server Error';
      case 502: return 'Bad Gateway';
      default: return 'Something Went Wrong';
    }
  }

  private getNumbersArray(code: number): string[] {
    const strCode = `${code}`;
    const arr: string[] = [];

    for (let i = 0; i < strCode.length; i++) arr.push(strCode[i % strCode.length]);
    return arr;
  }

  private getGif(code: number, mode: 'light' | 'dark'): string {
    const gifs: Record<number, { light: string; dark: string }> = {
      0: { light: 'assets/Offline-light.gif', dark: 'assets/Offline-dark.gif' },
      404: { light: 'assets/404-light.gif', dark: 'assets/404-dark.gif' },
      429: { light: 'assets/429-light.gif', dark: 'assets/429-dark.gif' },
      500: { light: 'assets/500-light.gif', dark: 'assets/500-dark.gif' },
      502: { light: 'assets/502-light.gif', dark: 'assets/502-dark.gif' },
    };
    return gifs[code]?.[mode];
  }

  private getDefaultErrorMessage(code: number): string {
    switch (code) {
      case 0: return 'You are offline. Check your internet connection and try again.';
      case 404: return 'The page you are looking for does not exist.';
      case 410: return 'This resource is no longer available.';
      case 429: return 'Too many requests. Please try again after some time.';
      case 500: return 'An internal server error occurred. We are working to fix it!';
      case 502: return 'The server encountered a temporary error. Please try again shortly.';
      default: return 'Something went wrong on our end. Please try again later.';
    }
  }

}