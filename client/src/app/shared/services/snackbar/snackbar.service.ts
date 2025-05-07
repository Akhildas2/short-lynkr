import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) { }

  private show(message: string, panelClass: string, duration: number = 3000) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    };
    this.snackBar.open(message, 'Dismiss', config);
  }

  showSuccess(message: string) {
    this.show(message, 'snackbar-success');
  }

  showError(message: string) {
    this.show(message, 'snackbar-error');
  }

  showWarning(message: string) {
    this.show(message, 'snackbar-warning');
  }

  showInfo(message: string) {
    this.show(message, 'snackbar-info');
  }

}
