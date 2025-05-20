import { Component, inject, OnInit } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';

@Component({
  selector: 'app-short-url-result',
  imports: [CommonModule, HeaderComponent, FooterComponent, MaterialModule],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private effects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

  urlCopied: boolean = false;
  selectedUrl = this.urlStore.selectedUrl;

  get selected(): UrlEntry | null {
    return this.selectedUrl();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.effects.fetchUrlById(id);
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
  }, 2000); // Hide message after 2 seconds
}

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank')
    }
  }
}
