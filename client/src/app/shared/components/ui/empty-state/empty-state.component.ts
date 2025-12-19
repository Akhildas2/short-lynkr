import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [SharedModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() icon: string = 'fas fa-info-circle';
  @Input() title: string = 'Nothing Found';
  @Input() description: string = 'No data available.';

  // Main action button
  @Input() actionText?: string;
  @Input() actionRoute?: string;
  @Input() actionIcon: string = 'fas fa-plus';
  @Input() actionCallback?: () => void;

  // Optional secondary clear button
  @Input() clearText?: string;
  @Input() clearCallback?: () => void;
  @Input() clearIcon: string = 'fas fa-eraser';


  constructor(private router: Router) { }

  navigate() {
    if (this.actionCallback) {
      this.actionCallback();
    } else if (this.actionRoute) {
      this.router.navigate([this.actionRoute]);
    }
  }

  clear() {
    if (this.clearCallback) {
      this.clearCallback();
    }
  }

}