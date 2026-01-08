import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value) return null;

    // Only whitespace
    if (value.trim().length === 0) {
        return { whitespace: true };
    }

    // Leading or trailing space
    if (value !== value.trim()) {
        return { leadingOrTrailingSpace: true };
    }

    // Multiple consecutive spaces
    if (/\s{2,}/.test(value)) {
        return { multipleSpaces: true };
    }

    return null;
}