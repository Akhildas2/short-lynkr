import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MaterialModule } from '../../../../../Material.Module';

@Component({
  selector: 'app-validation-error',
  imports: [CommonModule, MaterialModule],
  templateUrl: './validation-error.component.html',
  styleUrl: './validation-error.component.scss'
})
export class ValidationErrorComponent {
  @Input() control: AbstractControl | null = null;
}
