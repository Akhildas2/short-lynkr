import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-no-data',
  imports: [SharedModule],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.scss'
})
export class NoDataComponent {
  @Input() icon: string = 'info';
  @Input() title: string = 'No data available';
  @Input() description: string = 'Nothing to show right now.';
  @Input() variant: 'card' | 'overlay' = 'card';

}