import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { CustomizeUrlDialogComponent } from '../../../shared/components/customize-url-dialog/customize-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { UrlService } from '../../../core/services/api/url/url.service';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';

@Component({
  selector: 'app-short-url-result',
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule, RouterLink],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlService = inject(UrlService);
  private urlStore = inject(UrlStore);
  private snackbar = inject(SnackbarService);
  copySuccess = false;
  showQrSizes = false;
  selectedUrl = this.urlStore.selectedUrl;
  pollingSubscription!: Subscription;

  constructor(private dialog: MatDialog) { }

  get selected(): UrlEntry | null {
    return this.selectedUrl();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.urlEffects.fetchUrlById(id);

      // Start polling every 10 seconds
      this.pollingSubscription = interval(10000).subscribe(() => {
        this.urlEffects.fetchUrlById(id);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  copyToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text).then(() => {
        this.showSuccessMessage();
      });
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showSuccessMessage();
    }
  }

  private showSuccessMessage() {
    this.copySuccess = true;
    setTimeout(() => {
      this.copySuccess = false;
    }, 2000);
  }

  async openLink(shortUrl: string): Promise<void> {
    const shortId = this.extractShortId(shortUrl);
    if (!shortId) {
      this.snackbar.showError('Invalid short URL.');
      return;
    }

    const originalUrl = await this.urlEffects.redirectToOriginalUrl(shortId);
    if (originalUrl) {
      window.open(originalUrl, '_blank');
    }
  }

  private extractShortId(url: string): string | null {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/');
      return parts[parts.length - 1];
    } catch {
      return null;
    }
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
    const dialogRef = this.dialog.open(CustomizeUrlDialogComponent, {
      width: '500px',
      data: url
    });

    dialogRef.afterClosed().subscribe((result: Partial<UrlEntry>) => {
      if (result) {
        const { shortId, expiresAt, clickLimit, tags } = result;
        let expiryDays: number | undefined;
        if (expiresAt) {
          const today = new Date();
          const expiry = new Date(expiresAt);
          expiryDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        this.urlEffects.updateUrl(url._id, expiryDays || 0, shortId || '', clickLimit || 0, tags || '');
      }
    });
  }

}