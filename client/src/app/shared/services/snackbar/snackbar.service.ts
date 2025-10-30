import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  private show(
    message: string,
    panelClass: string,
    duration: number,
    position: 'top' | 'bottom' = 'top',
    horizontal: 'center' | 'right' | 'left' = 'right'
  ) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [panelClass],
      horizontalPosition: horizontal,
      verticalPosition: position,
    };
    this.snackBar.open(message, 'Dismiss', config);
  }

  showSuccess(message: string) {
    this.show(message, 'success-snackbar', 3000, 'top', 'right');
  }

  showError(message: string) {
    this.show(message, 'error-snackbar', 6000, 'top', 'center');
  }

  showWarning(message: string) {
    this.show(message, 'warning-snackbar', 4000, 'top', 'center');
  }

  showInfo(message: string) {
    this.show(message, 'info-snackbar', 3500, 'top', 'right');
  }

}