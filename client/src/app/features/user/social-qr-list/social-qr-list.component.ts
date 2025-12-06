import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { SocialQrStore } from '../../../state/qr/social-qr.store';
import { SocialQrEffects } from '../../../state/qr/social-qr.effects';
import { MatDialog } from '@angular/material/dialog';
import { SocialQrEntry } from '../../../models/qr/socialQr.interface';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { SocialQrDialogComponent } from '../../../shared/components/dialogs/social-qr-dialog/social-qr-dialog.component';
import { PLATFORM_COlORS, PLATFORM_ICONS, QR_FORMAT_COLORS, QR_SIZE_COLORS } from '../../../shared/utils/platform.helper';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { UserPageHeaderComponent } from '../../../shared/components/ui/user-page-header/user-page-header.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
type SocialQrFilterStatus = '' | 'jpeg' | 'png' | 'svg' | '300' | '500' | '750' | '1024';

@Component({
  selector: 'app-social-qr-list',
  imports: [SharedModule, EmptyStateComponent, SpinnerComponent, UserPageHeaderComponent, ScrollButtonsComponent],
  templateUrl: './social-qr-list.component.html',
  styleUrl: './social-qr-list.component.scss'
})
export class SocialQrListComponent implements OnInit {
  private store = inject(SocialQrStore);
  private effects = inject(SocialQrEffects);
  private dialog = inject(MatDialog);

  isLoading = false;
  socialQrs = computed(() => this.store.socialQrs());
  platformIcons = PLATFORM_ICONS;
  platformColors = PLATFORM_COlORS;
  formatColors = QR_FORMAT_COLORS;
  QR_SIZE_COLORS = QR_SIZE_COLORS;

  // Search & filter
  searchTerm = signal('');
  // Signal to hold label
  filterStatus = signal<SocialQrFilterStatus>('');
  filterStatusLabel = signal('All');
  filterOptions = [
    { label: 'All', value: '' },
    { label: 'Jpeg', value: 'jpeg' },
    { label: 'Png', value: 'png' },
    { label: 'Svg', value: 'svg' },
    { label: '300', value: '300' },
    { label: '500', value: '500' },
    { label: '750', value: '750' },
    { label: '1024', value: '1024' },
  ];

  // Method to change filter
  changeFilter(status: string) {
    this.filterStatus.set(status as SocialQrFilterStatus);
    const label = this.filterOptions.find(opt => opt.value === status)?.label || 'All';
    this.filterStatusLabel.set(label);
    this.pageIndex.set(0);
  }


  filteredQrs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.socialQrs().filter(qr => {
      // Search across multiple fields
      const matchesSearch =
        term === '' || // empty search matches all
        qr.accountUrl.toLowerCase().includes(term) ||
        qr.platform?.toLowerCase().includes(term) ||
        qr.format?.toLowerCase().includes(term);

      // Filter by selected format or size
      const matchesFilter =
        this.filterStatus() === '' || // 'All' option
        qr.format?.toLowerCase() === this.filterStatus() ||
        qr.size?.toString() === this.filterStatus();

      return matchesSearch && matchesFilter;
    });
  });


  // Pagination signals
  pageSize = signal(6);
  pageIndex = signal(0);

  paginatedQrs = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredQrs().slice(start, end);
  });

  constructor() {
    // Reset pageIndex if filtered list shrinks
    effect(() => {
      const filteredCount = this.filteredQrs().length;
      const currentPageStart = this.pageIndex() * this.pageSize();
      if (currentPageStart >= filteredCount && filteredCount > 0) {
        this.pageIndex.set(0);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      await this.effects.fetchSocialQrs();
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  getPlatformIcon(platform: string): string {
    return this.platformIcons[platform] || 'fas fa-globe';
  }

  getPlatformColor(platform: string): string {
    return this.platformColors[platform] || 'text-gray-500';
  }

  // Methods to return class strings
  getFormatClasses(format: string): string {
    const f = this.formatColors[format] || { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-500' };
    return `${f.bg} ${f.text} ${f.border}`;
  }

  getFormatDotClasses(format: string): string {
    return this.formatColors[format]?.dot || 'bg-gray-700';
  }

  async viewOrEditQr(qr: SocialQrEntry, mode: 'view' | 'edit') {
    const dialogRef = this.dialog.open(SocialQrDialogComponent, {
      width: '500px',
      data: { qrEntry: qr, mode }
    });

    dialogRef.afterClosed().subscribe(async updated => {
      if (updated && mode === 'edit') {
        // Optionally refresh the list
        await this.effects.fetchSocialQrs();
      }
    });
  }

  deleteQr(socialQrEntry: SocialQrEntry) {
    const dialog = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Delete QR Code?',
        content: `Are you sure you want to delete this QR Code: "${socialQrEntry.accountUrl}"? This action cannot be undone.`,
        actionText: 'Delete',
        actionIcon: 'delete',
        confirmOnly: true
      },
    });

    dialog.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.effects.deleteSocialQr(socialQrEntry._id);
      }
    });
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  clearFilter() {
    this.filterStatus.set('');
    this.filterStatusLabel.set('All');
  }

  clearSearchAndFilter() {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.filterStatusLabel.set('All');
    this.pageIndex.set(0);
  }
}