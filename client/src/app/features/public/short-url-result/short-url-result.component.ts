import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { interval, Subscription } from 'rxjs';
import { openInNewTab } from '../../../shared/utils/url.utils';
import { UrlService } from '../../../shared/services/url/url.service';
import { ClipboardService } from '../../../shared/services/clipboard/clipboard.service';
import { UrlDialogService } from '../../../shared/services/url-dialog/url-dialog.service';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { SocketService } from '../../../core/services/socket/socket.service';

@Component({
  selector: 'app-short-url-result',
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule, RouterLink],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

  showQrSizes = false;
  selectedUrl = this.urlStore.selectedUrl;

  constructor(private urlService: UrlService, private clipboardService: ClipboardService, private urlDialogService: UrlDialogService, private snackbar: SnackbarService, private socketService: SocketService) { }

  get selected(): UrlEntry | null {
    return this.selectedUrl();
  }

  ngOnInit(): void {
    this.socketService.connect();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.urlEffects.fetchUrlById(id);
    }
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

  toggleQrSizeOptions(): void {
    this.showQrSizes = !this.showQrSizes;
  }

  downloadQrImage(imageUrl: string, size: number): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `qr-code-${size}x${size}.png`;
        link.click();

        this.showQrSizes = false;
      }
    }

    img.onerror = () => {
      this.snackbar.showError('Failed to load QR image.');
    };
  }

  calculateDaysRemaining(expiryDate: string | Date): number {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  customizeUrl(url: UrlEntry) {
    this.urlDialogService.customizeUrl(url);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

}