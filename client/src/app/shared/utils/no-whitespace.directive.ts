import { Directive } from '@angular/core';
import {
    AbstractControl,
    NG_VALIDATORS,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { noWhitespaceValidator } from './noWhitespaceValidator';

@Directive({
    selector: '[noWhitespace]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: NoWhitespaceDirective,
            multi: true
        }
    ]
})
export class NoWhitespaceDirective implements Validator {

    validate(control: AbstractControl): ValidationErrors | null {
        return noWhitespaceValidator(control);
    }

}