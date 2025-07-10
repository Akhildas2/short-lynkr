import { Component, Inject, inject, OnInit } from '@angular/core';
import { AdminEffects } from '../../../../state/admin/admin.effects';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../models/user/user.model';
import { SharedModule } from '../../../shared.module';
import { ValidationErrorComponent } from '../../forms/validation-error/validation-error.component';

@Component({
  selector: 'app-admin-user-dialog',
  imports: [SharedModule, ReactiveFormsModule, ValidationErrorComponent],
  templateUrl: './admin-user-dialog.component.html',
  styleUrl: './admin-user-dialog.component.scss'
})
export class AdminUserDialogComponent implements OnInit {
  private adminEffects = inject(AdminEffects);
  form!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AdminUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', user?: User }
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(this.data.user?.username || '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]),
      email: new FormControl(this.data.user?.email || '', [
        Validators.required,
        Validators.email
      ]),
      role: new FormControl(this.data.user?.role || 'user', Validators.required),
      password: new FormControl('', this.data.mode === 'add' ? [
        Validators.required,
        Validators.minLength(8)
      ] : [])
    });
  }

  async submit() {
    if (this.form.invalid) return;

    const { username, email, role, password } = this.form.value;
    if (this.data.mode === 'add') {
      await this.adminEffects.addUser({ username, email, role, password });
    } else if (this.data.mode === 'edit' && this.data.user) {
      await this.adminEffects.updateUser(this.data.user._id, { username, email, role });
    }
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close();
  }

  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

}
