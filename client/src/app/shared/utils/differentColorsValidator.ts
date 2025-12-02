import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const sameColorValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const fg = control.get('foregroundColor')?.value?.toUpperCase();
    const bg = control.get('backgroundColor')?.value?.toUpperCase();

    return fg && bg && fg === bg ? { sameColor: true } : null;
};