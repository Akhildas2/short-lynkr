import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { RouterLink } from '@angular/router';

interface HeaderAction {
  label: string;
  icon?: string;
  click: () => void;
  color?: string;
  customClass?: string;
}

@Component({
  selector: 'app-user-page-header',
  imports: [SharedModule, RouterLink],
  templateUrl: './user-page-header.component.html',
  styleUrl: './user-page-header.component.scss'
})
export class UserPageHeaderComponent {
  @Input() title: string = '';
  @Input() isLoading: boolean = false;

  @Input() showSearch: boolean = false;
  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();

  @Input() showFilter: boolean = false;
  @Input() filterStatusLabel: string = '';
  @Input() filterOptions: { label: string; value: string }[] = [];
  @Output() filterChange = new EventEmitter<string>();

  @Input() createButtonText: string = '';
  @Input() createButtonLink: string = '';

  @Input() actionButtons: HeaderAction[] = [];

  onSearchChange(value: string) {
    this.searchTermChange.emit(value);
  }

  onFilterChange(value: string) {
    this.filterChange.emit(value);
  }

}