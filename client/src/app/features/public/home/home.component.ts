import { Component } from '@angular/core';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UrlEffects } from '../../../state/url/url.effects';

@Component({
    selector: 'app-home',
    imports: [HeaderComponent, FooterComponent, MaterialModule, ReactiveFormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    urlForm: FormGroup;
    constructor(private fb: FormBuilder, private urlEffects: UrlEffects) {
        this.urlForm = this.fb.group({
            originalUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/[\S]+/)]]
        });
    }

    async onSubmit(): Promise<void> {
        if (this.urlForm.invalid) {
            return;
        }

        const originalUrl = this.urlForm.value.originalUrl;
        await this.urlEffects.createUrl(originalUrl);
        this.urlForm.reset();
    }
}
