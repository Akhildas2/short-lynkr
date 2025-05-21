import { Component, inject, OnInit } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { CustomizeUrlDialogComponent } from '../../../shared/components/customize-url-dialog/customize-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-short-url-result',
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private urlEffects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

  urlCopied: boolean = false;
  selectedUrl = this.urlStore.selectedUrl;
  constructor(private dialog: MatDialog) { }

  get selected(): UrlEntry | null {
    return this.selectedUrl();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.urlEffects.fetchUrlById(id);
    }
    console.log('Selected URL:', this.selected);
  }

  copySuccess = false;

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

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank')
    }
  }

  customizeUrl(url: UrlEntry) {
    const dialogRef = this.dialog.open(CustomizeUrlDialogComponent, {
      width: '400px',
      data: url
    });

    dialogRef.afterClosed().subscribe((result: Partial<UrlEntry>) => {
      if (result) {
        const { customDomain, shortId, expiresAt } = result;
        let expiryDays: number | undefined;
        if (expiresAt) {
          const today = new Date();
          const expiry = new Date(expiresAt);
          expiryDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        this.urlEffects.updateUrl(url._id, expiryDays || 0, customDomain || '', shortId || '')
      }
    });
  }

}
