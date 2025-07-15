import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../../shared.module';
import { ThemeToggleComponent } from '../../../ui/theme-toggle/theme-toggle.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GlobalSearchService } from '../../../../services/global-search/global-search.service';

@Component({
  selector: 'app-admin-header',
  imports: [SharedModule, ThemeToggleComponent, ReactiveFormsModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarState: 0 | 1 | 2 = 1;
  @Input() collapsed = false;
  @Input() isMobile = false;
  showProfileMenu = false;
  showMobileSearch = false;
  isSmallDevice = false;

  searchControl = new FormControl(''); // FormControl for the search input
  private destroy$ = new Subject<void>(); // Subject to manage subscriptions

  constructor(private globalSearchService: GlobalSearchService) { }
  ngOnInit(): void {
    this.checkScreenSize();

    // Subscribe to search term changes from the service to pre-fill the input if navigated back
    this.globalSearchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        // Only update if the control's current value is different to avoid infinite loops
        if (this.searchControl.value !== term) {
          this.searchControl.setValue(term, { emitEvent: false }); // Do not emit event to avoid re-triggering
        }
      });

    // Listen for changes in the search input and push to the global service
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.globalSearchService.setSearchTerm(term || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isSmallDevice = window.innerWidth <= 430;
  }

  toggleProfileMenu(): boolean {
    return this.showProfileMenu = !this.showProfileMenu
  }

  toggleMobileSearch(): boolean {
    return this.showMobileSearch = !this.showMobileSearch
    if (!this.showMobileSearch) {
      this.clearSearch();
    }
  }

  get toggleIcon(): string {
    if (this.isMobile) {
      return this.sidebarState === 0 ? 'menu' : 'close';
    }
    return ['menu', 'chevron_right', 'close'][this.sidebarState];
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.globalSearchService.clearSearchTerm();
  }

}