import { Component, inject, OnInit } from '@angular/core';
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

  urlList = this.urlStore.urls;

  constructor(private urlService: UrlService, private clipboardService: ClipboardService) { }


  async ngOnInit(): Promise<void> {
    await this.urlEffects.fetchUserUrls();
  }

  toggleDropdown(id: string) {
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }

  openLink(url: string) {
     console.log('Opening URL:', url);
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
  exportUrl(url: UrlEntry) { /* your logic */ }

}
