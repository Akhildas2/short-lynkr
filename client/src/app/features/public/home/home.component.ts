import { Component } from '@angular/core';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UrlEffects } from '../../../state/url/url.effects';
import { CommonModule } from '@angular/common';
import { isShortUrl } from '../../../shared/utils/url.utils';
import { authEffects } from '../../../state/auth/auth.effects';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';

@Component({
    selector: 'app-home',
    imports: [HeaderComponent, FooterComponent, MaterialModule, ReactiveFormsModule, CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    urlForm: FormGroup;
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private urlEffects: UrlEffects,
        private authEffects: authEffects,
        private dialog: MatDialog
    ) {
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

        if (this.urlForm.invalid) {
            this.urlForm.markAllAsTouched();
            return;
        }

        const originalUrl = this.urlForm.value.originalUrl;
        if (isShortUrl(originalUrl)) {
            this.urlForm.setErrors({ alreadyShort: true });
            return;
        }

        const isAuthenticated = await this.authEffects.checkAuthStatus();
        if (!isAuthenticated) {
            this.dialog.open(AlertDialogComponent, {
                data: {
                    title: 'Login Required',
                    content: 'You need to log in to access this feature.',
                    actionText: 'Go to Login',
                    actionRoute: '/auth/sign-in'
                }
            });
            return;
        }

        await this.urlEffects.createUrl(originalUrl);
        this.urlForm.reset();
        this.submitted = false;
    }
}
