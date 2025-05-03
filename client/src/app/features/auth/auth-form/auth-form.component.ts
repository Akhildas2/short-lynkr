import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent,MaterialModule,FormsModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  isActive = false;

  toggleForm() {
    this.isActive = !this.isActive;
  }
}
