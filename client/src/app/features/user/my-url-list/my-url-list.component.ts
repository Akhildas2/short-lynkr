import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
export class MyUrlListComponent implements OnInit {
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  activeDropdownId: string | null = null;
  showFirstLastButtons = true;
  urlList = this.urlStore.urls;

  // Search & filter
  searchTerm = signal('');
  filterStatus = signal<'active' | 'inactive' | ''>('');
  filteredUrls = computed(() =>
    filterUrls(this.urlList(), this.searchTerm(), this.filterStatus())
  )

  // Pagination
  paginatedUrls: UrlEntry[] = [];
  pageSize = 6;
  pageIndex = 0;

  constructor(private urlService: UrlService, private clipboardService: ClipboardService, private urlDialogService: UrlDialogService, private dialog: MatDialog, private socketService: SocketService) {
    effect(() => {
      this.pageIndex = 0;
      this.updatePaginateUrls(this.filteredUrls())
    });
  }

  async ngOnInit(): Promise<void> {
    this.socketService.connect();
    await this.urlEffects.fetchUserUrls();
    this.updatePaginateUrls(this.filteredUrls());
  }

  updatePaginateUrls(urls: UrlEntry[]): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUrls = urls.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginateUrls(this.filteredUrls());
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

  editUrl(url: UrlEntry): void {
    this.urlDialogService.customizeUrl(url);
  }

  clearSearchAndFilter() {
    this.searchTerm.set('');
    this.filterStatus.set('');
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

}
