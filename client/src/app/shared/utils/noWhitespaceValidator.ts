import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    // Check if value contains any spaces
    if (/\s/.test(value)) {
        return { whitespace: true };
    }
    return null;
}