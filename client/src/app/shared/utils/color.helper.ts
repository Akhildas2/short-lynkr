import { AbstractControl } from '@angular/forms';

// Auto-uppercase hex color
export function uppercaseColor(control: AbstractControl) {
    if (control.value) {
        control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
}