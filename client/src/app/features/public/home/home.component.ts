import { Component } from '@angular/core';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UrlEffects } from '../../../state/url/url.effects';
import { CommonModule } from '@angular/common';
import { isShortUrl } from '../../../shared/utils/url.utils';
import { authEffects } from '../../../state/auth/auth.effects';

@Component({
    selector: 'app-home',
    imports: [HeaderComponent, FooterComponent, MaterialModule, ReactiveFormsModule, CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    urlForm: FormGroup;
    submitted = false;

    constructor(private fb: FormBuilder, private urlEffects: UrlEffects,private authEffects:authEffects) {
        this.urlForm = this.fb.group({
            originalUrl: ['', [Validators.required, Validators.pattern(
                /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
            )]]
        });
        this.urlForm.get('originalUrl')?.valueChanges.subscribe(() => {
            if (this.submitted) {
                this.urlForm.setErrors(null);
                this.submitted = false;
            }
        });
    }

    async onSubmit(): Promise<void> {
        this.submitted = true;
        this.authEffects.checkAuthStatus()
        if (this.urlForm.invalid) {
            this.urlForm.markAllAsTouched();
            return;
        }

        const originalUrl = this.urlForm.value.originalUrl;
        if (isShortUrl(originalUrl)) {
            this.urlForm.setErrors({ alreadyShort: true });
            return;
        }

        await this.urlEffects.createUrl(originalUrl);
        this.urlForm.reset();
        this.submitted = false;
    }
}
