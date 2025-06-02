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
  private urlEffects = inject(UrlEffects)
  private urlStore = inject(UrlStore)

  urlList = this.urlStore.urls;

  async ngOnInit(): Promise<void> {
    await this.urlEffects.fetchUserUrls();
  }
  deleteUrl(arg0: any) {
    throw new Error('Method not implemented.');
  }
  editUrl(_t7: any) {
    throw new Error('Method not implemented.');
  }
  copyToClipboard(arg0: any) {
    throw new Error('Method not implemented.');
  }

}
