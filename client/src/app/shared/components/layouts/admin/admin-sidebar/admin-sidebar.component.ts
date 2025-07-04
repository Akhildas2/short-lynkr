import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [SharedModule, RouterLink],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  @Input() collapsed = false;

}