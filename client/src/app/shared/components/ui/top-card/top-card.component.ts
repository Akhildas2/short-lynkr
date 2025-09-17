import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { NoDataComponent } from '../no-data/no-data.component';

@Component({
  selector: 'app-top-card',
  imports: [SharedModule, NoDataComponent],
  templateUrl: './top-card.component.html',
  styleUrl: './top-card.component.scss'
})
export class TopCardComponent {
  @Input() title!: string;
  @Input() items: any[] | null = [];

  @Input() noDataVariant: 'card' | 'overlay' = 'card';
  @Input() noDataIcon: string = 'link_off';
  @Input() noDataTitle: string = 'No data available';
  @Input() noDataDescription: string = 'Nothing to show right now.';

}