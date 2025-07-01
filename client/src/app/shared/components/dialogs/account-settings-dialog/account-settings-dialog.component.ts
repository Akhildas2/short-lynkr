import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthEffects } from '../../../../state/auth/auth.effects';
import { AuthStore } from '../../../../state/auth/auth.store';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { ValidationErrorComponent } from '../../forms/validation-error/validation-error.component';

@Component({
  selector: 'app-account-settings-dialog',
  imports: [SharedModule, ReactiveFormsModule, ValidationErrorComponent],
  templateUrl: './account-settings-dialog.component.html',
  styleUrl: './account-settings-dialog.component.scss'
})
export class AccountSettingsDialogComponent implements OnInit {
  private authStore = inject(AuthStore);
  form!: FormGroup;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AccountSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'edit' | 'password' },
    private authEffects: AuthEffects) { }

  ngOnInit(): void {
    if (this.data.mode === 'edit') {
      const user = this.authStore.user();
      this.form = new FormGroup({
        username: new FormControl(user?.username || '', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
        email: new FormControl(user?.email || '', [Validators.required, Validators.email])
      });
    }
    if (this.data.mode === 'password') {
      this.form = new FormGroup({
        currentPassword: new FormControl('', Validators.required),
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`])[A-Za-z\\d!@#$%^&*()_+\\-={}\\[\\]|:;"\'<>,.?/~`]{8,}$')
        ])
      });
    }
  }

  async submit() {
    if (this.form.invalid) return;

    if (this.data.mode === 'edit') {
      const { username, email } = this.form.value;
      await this.authEffects.editProfile(username, email);
    }
    if (this.data.mode === 'password') {
      const { currentPassword, newPassword } = this.form.value;
      await this.authEffects.changePassword(currentPassword, newPassword);
    }

    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close();
  }

  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

}