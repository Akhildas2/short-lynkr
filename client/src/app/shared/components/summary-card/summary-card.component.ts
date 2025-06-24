import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-summary-card',
  imports: [SharedModule],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  @Input() title!: string;
  @Input() value!: number | string;
  @Input() icon!: string;
  @Input() change: number = 0;
  @Input() changeText: string = '';
  @Input() iconBgClass: string = '';
  @Input() iconColorClass: string = '';

}