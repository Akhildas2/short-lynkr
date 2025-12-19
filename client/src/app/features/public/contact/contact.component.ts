import { Component, effect } from '@angular/core';
import { UserHeaderComponent } from '../../../shared/components/layouts/user/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/layouts/user/user-footer/user-footer.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/api/contact/contact.service';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { noWhitespaceValidator } from '../../../shared/utils/noWhitespaceValidator';
import { RouterLink } from '@angular/router';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';

@Component({
  selector: 'app-contact',
  imports: [UserHeaderComponent, UserFooterComponent, SharedModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  isloading = false;
  contactForm!: FormGroup;
  supportEmail = 'support@example.com';

  constructor(private fb: FormBuilder, private contactService: ContactService, private snackbarService: SnackbarService, private settingsEffects: AdminSettingsEffects) {
    effect(() => {
      this.supportEmail = this.settingsEffects.supportEmail();
    });

    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30), noWhitespaceValidator]],
      subject: ['', [Validators.required, Validators.maxLength(60), noWhitespaceValidator]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), noWhitespaceValidator]]
    });

  }

  getError(controlName: string): string | null {
    const control = this.contactForm.get(controlName);

    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    }

    if (control.errors['email']) {
      return 'Enter a valid email address';
    }

    if (control.errors['pattern']) {
      return 'Enter a valid value';
    }

    if (control.errors['whitespace']) {
      return 'Cannot contain only spaces';
    }

    return null;
  }


  submit(formDirective: FormGroupDirective) {
    if (this.contactForm.invalid) return;

    this.isloading = true;

    this.contactService.sendMessage(this.contactForm.value).subscribe({
      next: () => {
        this.isloading = false;
        this.snackbarService.showSuccess('Message sent successfully');

        formDirective.resetForm();
      },
      error: () => {
        this.isloading = false;
        this.snackbarService.showError('Failed to send message');
      }
    });
  }


}