import { Component, OnInit } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UrlEffects } from '../../../state/url/url.effects';
import { isShortUrl } from '../../../shared/utils/url.utils';
import { AuthEffects } from '../../../state/auth/auth.effects';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/ui/loader/loader.component';
import { SharedModule } from '../../../shared/shared.module';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { AdminSettings } from '../../../models/settings/adminSettings.interface';

@Component({
    selector: 'app-home',
    imports: [UserHeaderComponent, UserFooterComponent, MaterialModule, ReactiveFormsModule, LoaderComponent, SharedModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    urlForm: FormGroup;
    submitted = false;
    isLoading = false;
    customizeEnabled = false;
    tags: string[] = ['Personal', 'Work', 'Project', 'Marketing', 'important', 'Other'];
    settings: AdminSettings | null = null;

    constructor(
        private fb: FormBuilder,
        private urlEffects: UrlEffects,
        private authEffects: AuthEffects,
        private dialog: MatDialog,
        private router: Router,
        private settingsEffects: AdminSettingsEffects
    ) {
        this.urlForm = this.fb.group({
            originalUrl: ['', [
                Validators.required,
                Validators.pattern(/^https?:\/\/.+/)
            ]],
            customizeEnabled: [false],
            customCode: ['', [Validators.minLength(4), Validators.maxLength(this.settings?.urlSettings?.defaultLength || 8), Validators.pattern(/^[a-zA-Z0-9_-]*$/)]],
            expiryDays: [0, [Validators.min(0), Validators.max(100)]],
            clickLimit: [0, [Validators.min(0), Validators.max(1000)]],
            tags: [[]]
        });

        // Reset submitted and custom error
        this.urlForm.get('originalUrl')?.valueChanges.subscribe(() => {
            if (this.submitted) this.submitted = false;
            if (this.urlForm.hasError('alreadyShort')) this.urlForm.setErrors(null);
        });
    }


    async ngOnInit(): Promise<void> {
        this.settings = await this.settingsEffects.loadSettings();
        if (this.settings) {
            this.applyAdminSettings(this.settings);
        }
    }


    private applyAdminSettings(settings: AdminSettings): void {
        const urlSettings = settings.urlSettings;

        // Update validators according to settings
        this.urlForm.get('customCode')?.setValidators([
            Validators.minLength(4),
            Validators.maxLength(urlSettings.defaultLength || 8),
            ...(urlSettings.allowCustomSlugs ? [] : [Validators.nullValidator]) // 🔹 disable if not allowed
        ]);

        this.urlForm.get('expiryDays')?.setValidators([
            Validators.min(0),
            Validators.max(urlSettings.expirationDaysLimit || 100)
        ]);

        this.urlForm.get('clickLimit')?.setValidators([
            Validators.min(0),
            Validators.max(urlSettings.maxClickPerUrl || 1000)
        ]);

        this.urlForm.updateValueAndValidity();
    }

    // Helper to calculate expiry date
    todayPlusDays(days: number): Date {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }

    async onSubmit(): Promise<void> {
        this.submitted = true;

        if (this.urlForm.invalid) {
            this.urlForm.markAllAsTouched();
            return;
        }

        const { originalUrl, customCode, expiryDays, clickLimit, tags } = this.urlForm.value;

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
                    actionIcon: 'trending_flat',
                    actionRoute: '/auth/sign-in',
                    confirmOnly: false
                }
            });
            return;
        }

        this.isLoading = true;

        setTimeout(async () => {
            try {
                const url = await this.urlEffects.createUrl(originalUrl, expiryDays, customCode, clickLimit, tags);
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