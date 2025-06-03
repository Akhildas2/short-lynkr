import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MaterialModule } from '../../../../Material.Module';
import { CommonModule } from '@angular/common';
import { UrlEntry } from '../../../models/url/url.model';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlStore } from '../../../state/url/url.store';

@Component({
  selector: 'app-my-url-list',
  imports: [HeaderComponent, FooterComponent, MaterialModule, CommonModule],
  templateUrl: './my-url-list.component.html',
  styleUrl: './my-url-list.component.scss'
})
export class MyUrlListComponent implements OnInit {
view(_t7: UrlEntry) {
throw new Error('Method not implemented.');
}
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  urlList = this.urlStore.urls;

  async ngOnInit(): Promise<void> {
    await this.urlEffects.fetchUserUrls();
  }
activeDropdown: string | null = null;

toggleDropdown(id: string) {
  this.activeDropdown = this.activeDropdown === id ? null : id;
}

editUrl(url: UrlEntry) { /* your logic */ }
deleteUrl(url: UrlEntry) { /* your logic */ }
exportUrl(url: UrlEntry) { /* your logic */ }
fallbackQr = 'https://via.placeholder.com/96x96.png?text=QR';

}
