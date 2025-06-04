import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[validateClickLimit]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ClickLimitValidatorDirective,
      multi: true,
    },
  ],
})
export class ClickLimitValidatorDirective implements Validator {
  @Input('validateClickLimit') currentClicks: number = 0;

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === 0 || value > this.currentClicks) {
      return null;
    }
    return { clickLimitInvalid: true };
  }
}