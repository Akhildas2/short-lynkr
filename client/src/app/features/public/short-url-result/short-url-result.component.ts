import { Component, inject, OnInit } from '@angular/core';
import { UrlEntry } from '../../../models/url/url.model';
import { ActivatedRoute } from '@angular/router';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-short-url-result',
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './short-url-result.component.html',
  styleUrl: './short-url-result.component.scss'
})
export class ShortUrlResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private effects = inject(UrlEffects);
  private urlStore = inject(UrlStore);

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
  copyToClipboard(text: string) {

  }
}
