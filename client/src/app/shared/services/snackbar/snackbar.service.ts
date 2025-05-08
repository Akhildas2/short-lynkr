import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  private show(message: string, panelClass: string, duration: number) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [panelClass],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    };
    this.snackBar.open(message, 'Dismiss', config);
  }

  showSuccess(message: string) {
    this.show(message, 'success-snackbar', 3000);
  }

  showError(message: string) {
    this.show(message, 'error-snackbar', 5000);
  }

  showWarning(message: string) {
    this.show(message, 'warning-snackbar', 4000);
  }

  showInfo(message: string) {
    this.show(message, 'info-snackbar', 3500);
  }

}
