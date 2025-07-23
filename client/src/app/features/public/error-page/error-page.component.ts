import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-error-page',
  imports: [SharedModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent implements OnInit {
  code!: number;
  message!: string;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.code = parseInt(params['code'], 10);
      this.message = params['message'] || 'Something went wrong.';
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  getIconClass(code: number): string {
    switch (code) {
      case 404: return 'sentiment_dissatisfied';
      case 410: return 'delete_forever';
      case 429: return 'hourglass_empty';
      case 500: return 'bug_report';
      default: return 'error_outline';
    }
  }

  getDefaultErrorMessage(errorCode: number | string | undefined): string {
    switch (errorCode) {
      case 404:
        return 'The page you are looking for does not exist.';
      case 410:
        return 'This resource is no longer available.';
      case 429:
        return 'Too many requests. Please try again after some time.';
      case 500:
        return 'An internal server error occurred. We are working to fix it!';
      default:
        return 'Something went wrong on our end. Please try again later.';
    }
  }

}