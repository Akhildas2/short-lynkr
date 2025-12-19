import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Card } from '../../../../models/sections/section.interface';

@Component({
  selector: 'app-section-cards',
  imports: [SharedModule],
  templateUrl: './section-cards.component.html',
  styleUrl: './section-cards.component.scss'
})
export class SectionCardsComponent {
  @Input() title!: string;
  @Input() cards: Card[] = [];
  @Input() columns: number = 3;

}