import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-stats-list',
  imports: [SharedModule],
  templateUrl: './stats-list.component.html',
  styleUrl: './stats-list.component.scss'
})
export class StatsListComponent {
  @Input() title = '';
  @Input() items: { name: string; value?: number; percentage: number }[] = [];
  @Input() iconMap: Record<string, string> = {};
  @Input() fallbackIcon: string = 'public';
  @Input() showProgressBar = true;
  @Input() emptyText: string = 'No data available.';


}