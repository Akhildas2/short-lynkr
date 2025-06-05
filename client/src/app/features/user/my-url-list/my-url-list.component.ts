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

@Component({
  selector: 'app-my-url-list',
  imports: [HeaderComponent, FooterComponent, MaterialModule, CommonModule, RouterLink],
  templateUrl: './my-url-list.component.html',
  styleUrl: './my-url-list.component.scss'
})
export class MyUrlListComponent implements OnInit {
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  activeDropdown: string | null = null;
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

  constructor(private urlService: UrlService, private clipboardService: ClipboardService) {
    effect(() => {
      this.pageIndex = 0;
      this.updatePaginateUrls(this.filteredUrls())
    });
  }

  async ngOnInit(): Promise<void> {
    await this.urlEffects.fetchUserUrls();
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

  toggleDropdown(id: string) {
    this.activeDropdown = this.activeDropdown === id ? null : id;
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

  editUrl(url: UrlEntry) { /* your logic */ }
  deleteUrl(url: UrlEntry) { /* your logic */ }

}
