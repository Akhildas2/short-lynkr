import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { PLATFORM_BASE_URL } from "./platform.helper";

export function platformUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const platform = control.parent?.get('platform')?.value;
        if (!platform || platform === 'Other') return null;

        const baseUrl = PLATFORM_BASE_URL[platform];
        if (!baseUrl) return null;

        if (!control.value.startsWith(baseUrl)) {
            return { platformUrl: { requiredBase: baseUrl, actual: control.value } };
        }

        return null;
    };
}