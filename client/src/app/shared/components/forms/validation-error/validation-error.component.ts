import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MaterialModule } from '../../../../../Material.Module';

@Component({
  selector: 'app-validation-error',
  imports: [CommonModule, MaterialModule],
  templateUrl: './validation-error.component.html',
  styleUrl: './validation-error.component.scss'
})
export class ValidationErrorComponent {
  @Input() control: AbstractControl | null = null;

  getError(): string | null {
    const control = this.control;
    if (!control || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Please enter a valid email address.';
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters.`;
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters.`;
    }
    if (control.errors['pattern']) {
      return 'Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
    }
    return null;
  }

}