import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { FAQ } from '../../../../models/sections/section.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-faq',
  imports: [SharedModule, RouterLink],
  templateUrl: './section-faq.component.html',
  styleUrl: './section-faq.component.scss'
})
export class SectionFaqComponent {
  @Input() faqs: FAQ[] = [];

}