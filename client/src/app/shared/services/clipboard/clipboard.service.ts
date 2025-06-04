import { Injectable } from '@angular/core';
import { SnackbarService } from '../snackbar/snackbar.service';

@Injectable({
  providedIn: 'root'
})

export class ClipboardService {
  copySuccess = false;

  constructor(private snackbar: SnackbarService) { }

  copyToClipboard(text: string): void {
    try {
      navigator.clipboard.writeText(text).then(() => {
        this.showSuccessMessage();
      });
    } catch (err) {
      // Fallback for unsupported browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showSuccessMessage();
    }
  }

  private showSuccessMessage(): void {
    this.copySuccess = true;
    this.snackbar.showSuccess('Copied to clipboard');
    setTimeout(() => {
      this.copySuccess = false;
    }, 2000);
  }
}