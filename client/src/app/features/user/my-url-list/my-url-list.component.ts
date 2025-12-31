import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { Router, RouterLink } from '@angular/router';
import { ClipboardService } from '../../../shared/services/clipboard/clipboard.service';
import { PageEvent } from '@angular/material/paginator';
import { filterUrls } from '../../../shared/utils/url-filter.util';
import { UrlDialogService } from '../../../shared/services/url-dialog/url-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { SocketService } from '../../../core/services/socket/socket.service';
import { SharedModule } from '../../../shared/shared.module';
import { openUrl } from '../../../shared/utils/url.utils';
import { AdminSettings } from '../../../models/settings/adminSettings.interface';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { UserPageHeaderComponent } from '../../../shared/components/ui/user-page-header/user-page-header.component';
import { firstValueFrom } from 'rxjs';
type UrlFilterStatus = '' | 'active' | 'blocked';

@Component({
  selector: 'app-my-url-list',
  imports: [SharedModule, RouterLink, EmptyStateComponent, SpinnerComponent, ScrollButtonsComponent, UserPageHeaderComponent],
  templateUrl: './my-url-list.component.html',
  styleUrl: './my-url-list.component.scss'
})
export class MyUrlListComponent implements OnInit, OnDestroy {
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  activeDropdownId: string | null = null;
  showFirstLastButtons = true;
  adminSettings: AdminSettings | null = null;
  isLoading = false;
  copied: Record<string, boolean> = {};
  tagsDropdown: Record<string, boolean> = {};

  urlList = computed(() => this.urlStore.urls());

  // Search & filter
  searchTerm = signal('');
  filterStatus = signal<UrlFilterStatus>('');
  filterStatusLabel = signal('All');
  filteredUrls = computed(() =>
    filterUrls(this.urlList(), this.searchTerm(), this.filterStatus())
  )
  filterOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' }
  ];

  // Change filter + update label
  changeFilter(status: string) {
    const typedStatus = status as UrlFilterStatus;
    this.filterStatus.set(typedStatus);
    this.filterStatusLabel.set(
      typedStatus === '' ? 'All' : typedStatus === 'active' ? 'Active' : 'Blocked'
    );
    this.pageIndex.set(0);
  }

  // Pagination signals
  pageSize = signal(6);
  pageIndex = signal(0);

  // Pagination
  paginatedUrls = computed(() => {
    const urls = this.filteredUrls();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return urls.slice(start, end);
  });

  openUrlHandler(url: string, newTab: boolean = true): void {
    openUrl(url, newTab);
  }

  constructor(private clipboardService: ClipboardService, private urlDialogService: UrlDialogService, private dialog: MatDialog, private socketService: SocketService, private settingsEffects: AdminSettingsEffects, private router: Router) {
    effect(() => {
      const filteredCount = this.filteredUrls().length;
      const currentPageStart = this.pageIndex() * this.pageSize();

      if (currentPageStart >= filteredCount && filteredCount > 0) {
        this.pageIndex.set(0);
      }
    });
  }

  toggleTagsDropdown(id: string) {
    this.tagsDropdown[id] = !this.tagsDropdown[id];
  }

  closeTagsDropdown(id: string) {
    this.tagsDropdown[id] = false;
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      this.adminSettings = await this.settingsEffects.loadSettings();
      this.socketService.connect();
      await this.urlEffects.fetchUserUrls();
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  isDropdownActive(id: string): boolean {
    return this.activeDropdownId === id;
  }

  closeDropdown() {
    this.activeDropdownId = null;
  }

  copyUrl(url: string): void {
    this.clipboardService.copyToClipboard(url);

    this.copied[url] = true;

    setTimeout(() => {
      this.copied[url] = false;
    }, 2000);
  }

  // Navigate to the URL view page
  viewUrl(url: any) {
    this.router.navigate(['/user/shortened', url._id]);
  }

  // Toggle active/block status
  async toggleBlock(url: UrlEntry) {
    const newStatus = !url.isBlocked;
    const action = newStatus ? 'Block' : 'Unblock';
    const icon = newStatus ? 'block' : 'check_circle';

    const confirmed = await firstValueFrom(
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: `${action} URL`,
          content: `Are you sure you want to ${action.toLowerCase()} the URL "${url.shortUrl}"?`,
          actionText: action,
          actionIcon: icon,
          confirmOnly: true
        }
      }).afterClosed()
    );

    if (confirmed) {
      await this.urlEffects.toggleBlockUrl(url._id, newStatus);
    }
  }


  editUrl(url: UrlEntry) {
    this.urlDialogService.customizeUrl(url);
    this.urlEffects.fetchUserUrls();
  }

  clearSearchAndFilter() {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.pageIndex.set(0);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  clearFilter() {
    this.filterStatus.set('');
    this.filterStatusLabel.set('All');
  }


  deleteUrl(url: UrlEntry) {
    const dialog = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Delete URL?',
        content: `Are you sure you want to delete this URL: "${url.shortUrl}"? This action cannot be undone.`,
        actionText: 'Delete',
        actionIcon: 'delete',
        confirmOnly: true
      },
    });

    dialog.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.urlEffects.deleteUrl(url._id);
      }
    });
  }

  trackByUrlId(index: number, url: UrlEntry): string {
    return url._id;
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

}