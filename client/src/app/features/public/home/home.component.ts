import { Component, inject } from '@angular/core';
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
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { UrlStore } from '../../../state/url/url.store';

@Component({
    selector: 'app-home',
    imports: [HeaderComponent, FooterComponent, MaterialModule, ReactiveFormsModule, CommonModule, LoaderComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    urlForm: FormGroup;
    submitted = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private urlEffects: UrlEffects,
        private authEffects: authEffects,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.urlForm = this.fb.group({
            originalUrl: ['', [Validators.required, Validators.pattern(
                /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
            )]]
        });
        this.urlForm.get('originalUrl')?.valueChanges.subscribe(() => {
            if (this.submitted) {
                this.submitted = false;
            }

            if (this.urlForm.hasError('alreadyShort')) {
                this.urlForm.setErrors(null);
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
                    title: 'Sign In Required',
                    content: 'This feature is only available to logged-in users. Please sign in to continue.',
                    actionText: 'Sign In',
                    actionRoute: '/auth/sign-in',
                    confirmOnly: false
                }
            });
            return;
        }

        this.isLoading = true;

        setTimeout(async () => {
            try {
                const url = await this.urlEffects.createUrl(originalUrl);
                this.isLoading = false;

                if (url && url._id) {
                    this.urlForm.reset();
                    this.submitted = false;
                    this.router.navigate(['/user/shortened', url._id]);
                }
            } catch (e) {
                this.isLoading = false;
            }

        }, 3000);

    }
}