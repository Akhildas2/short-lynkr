import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared.module';

export type ErrorVariant = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'app-error-message',
  imports: [SharedModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  @Input() title = 'Oops! Something went wrong';
  @Input() message = 'An unexpected error occurred. Please try again later.';
  @Input() icon = 'error';
  @Input() retryText = 'Retry';
  @Input() showRetry = true;
  @Input() isLoading = false;
  @Input() variant: ErrorVariant = 'error';

  @Output() retry = new EventEmitter<void>();

  onRetry() {
    if (!this.isLoading) {
      this.retry.emit();
    }
  }

  get containerClasses(): string {
    const base = 'rounded-lg p-4 border flex items-start';
    const variants: Record<ErrorVariant, string> = {
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    };
    return `${base} ${variants[this.variant]}`;
  }

  get iconColor(): string {
    const map: Record<ErrorVariant, string> = {
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      success: 'text-green-400',
    };
    return map[this.variant];
  }

  get titleColor(): string {
    const map: Record<ErrorVariant, string> = {
      error: 'text-red-800 dark:text-red-200',
      warning: 'text-yellow-800 dark:text-yellow-200',
      info: 'text-blue-800 dark:text-blue-200',
      success: 'text-green-800 dark:text-green-200',
    };
    return map[this.variant];
  }

  get messageColor(): string {
    const map: Record<ErrorVariant, string> = {
      error: 'text-red-700 dark:text-red-300',
      warning: 'text-yellow-700 dark:text-yellow-300',
      info: 'text-blue-700 dark:text-blue-300',
      success: 'text-green-700 dark:text-green-300',
    };
    return map[this.variant];
  }

}