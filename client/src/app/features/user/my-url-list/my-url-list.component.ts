import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { CommonModule } from '@angular/common';
import { UrlEntry } from '../../../models/url/url.model';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { RouterLink } from '@angular/router';
import { openInNewTab } from '../../../shared/utils/url.utils';
import { UrlService } from '../../../shared/services/url/url.service';
import { ClipboardService } from '../../../shared/services/clipboard/clipboard.service';
import { PageEvent } from '@angular/material/paginator';
import { filterUrls } from '../../../shared/utils/url-filter.util';
import { UrlDialogService } from '../../../shared/services/url-dialog/url-dialog.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { SocketService } from '../../../core/services/socket/socket.service';

@Component({
  selector: 'app-my-url-list',
  imports: [HeaderComponent, FooterComponent, MaterialModule, CommonModule, RouterLink, ClickOutsideDirective],
  templateUrl: './my-url-list.component.html',
  styleUrl: './my-url-list.component.scss'
})
export class MyUrlListComponent implements OnInit, OnDestroy {
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  activeDropdownId: string | null = null;
  showFirstLastButtons = true;

  urlList = computed(() => this.urlStore.urls());

  // Search & filter
  searchTerm = signal('');
  filterStatus = signal<'active' | 'inactive' | ''>('');
  filteredUrls = computed(() =>
    filterUrls(this.urlList(), this.searchTerm(), this.filterStatus())
  )

  // Pagination
  paginatedUrls = computed(() => {
    const urls = this.filteredUrls();
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return urls.slice(start, end);
  });

  pageSize = 6;
  pageIndex = 0;

  constructor(private urlService: UrlService, private clipboardService: ClipboardService, private urlDialogService: UrlDialogService, private dialog: MatDialog, private socketService: SocketService) {
    effect(() => {
      const filteredCount = this.filteredUrls().length;
      if (this.pageIndex * this.pageSize >= filteredCount && filteredCount > 0) {
        this.pageIndex = 0;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.socketService.connect();
    await this.urlEffects.fetchUserUrls();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
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

  openLink(url: string) {
    this.urlService.openShortUrl(url);
  }

  openExternalPage(url: string): void {
    openInNewTab(url);
  }

  copyUrl(url: string): void {
    this.clipboardService.copyToClipboard(url);
  }

  editUrl(url: UrlEntry) {
    this.urlDialogService.customizeUrl(url);
    this.urlEffects.fetchUserUrls();
  }

  clearSearchAndFilter() {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.pageIndex = 0;
  }

  deleteUrl(url: UrlEntry) {
    const dialog = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Delete URL?',
        content: `Are you sure you want to delete this URL: "${url.shortUrl}"? This action cannot be undone.`,
        actionText: 'Delete',
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