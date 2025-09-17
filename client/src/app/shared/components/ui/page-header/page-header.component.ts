import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeRangeKey } from '../../../../models/analytic/adminAnalytics.interface';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-page-header',
  imports: [SharedModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() url?: string;
  @Input() timeRanges!: { [key: string]: string };
  @Input() selectedRange!: string;
  @Input() isLoading = false;

  @Output() rangeChange = new EventEmitter<TimeRangeKey>();
  @Output() refresh = new EventEmitter<void>();

  changeRange(range: string) {
    this.rangeChange.emit(range as TimeRangeKey);
  }

  refreshData() {
    if (!this.isLoading) {
      this.refresh.emit();
    }
  }

}