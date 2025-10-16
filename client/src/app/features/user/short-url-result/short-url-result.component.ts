import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { QrCode, UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { openUrl } from '../../../shared/utils/url.utils';
import { ClipboardService } from '../../../shared/services/clipboard/clipboard.service';
import { UrlDialogService } from '../../../shared/services/url-dialog/url-dialog.service';
import { SnackbarService } from '../../../shared/services/snackbar/snackbar.service';
import { SocketService } from '../../../core/services/socket/socket.service';
import { SharedModule } from '../../../shared/shared.module';
import { AdminSettings } from '../../../models/settings/adminSettings.interface';
import { AdminSettingsEffects } from '../../../state/settings/settings.effects';
import { UrlService } from '../../../core/services/api/url/url.service';

@Component({
  selector: 'app-short-url-result',
  imports: [SharedModule, RouterLink],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

  showQrOptions = false;
  selectedSize: number | null = null;
  selectedFormat: 'PNG' | 'SVG' | 'JPEG' | null = null;

  QR_SIZES: number[] = [];
  QR_FORMATS: ('PNG' | 'SVG' | 'JPEG')[] = [];
  adminSettings: AdminSettings | null = null;
  selectedUrl = this.urlStore.selectedUrl;

  constructor(private clipboardService: ClipboardService, private urlDialogService: UrlDialogService, private snackbar: SnackbarService, private socketService: SocketService, private settingsEffects: AdminSettingsEffects, private urlService: UrlService) { }

  async ngOnInit(): Promise<void> {
    this.socketService.connect();

    try {
      this.adminSettings = await this.settingsEffects.loadSettings();
      this.QR_SIZES = this.adminSettings?.qrSettings.allowedSizes ?? [300, 500, 750, 1024];
      this.QR_FORMATS = this.adminSettings?.qrSettings.allowedFormat ?? ['PNG', 'SVG', 'JPEG'];

    } catch (error) {
      this.QR_SIZES = [300, 500, 750, 1024];
      this.QR_FORMATS = ['PNG', 'SVG', 'JPEG'];
      this.selectedFormat = 'PNG';
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.urlEffects.fetchUrlById(id);
    }
  }

  openUrlHandler(url: string, newTab: boolean = true): void {
    openUrl(url, newTab);
  }

  copyUrl(url: string): void {
    this.clipboardService.copyToClipboard(url);
  }

  toggleQrOptions(): void {
    this.showQrOptions = !this.showQrOptions;
  }

  downloadQrImage(id: string, size: number, format: string, shortId: string) {
    this.urlService.getQrUrl(id, size, format).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${shortId}-${size}x${size}.${format.toLowerCase()}`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
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