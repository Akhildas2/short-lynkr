import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { GlobalSearchService } from '../../../shared/services/global-search/global-search.service';
import { BaseSocialQrComponent } from '../../../shared/base/base-social-qr.component';

@Component({
  selector: 'app-admin-social-qr',
  imports: [SharedModule, EmptyStateComponent, SpinnerComponent, ScrollButtonsComponent],
  templateUrl: './admin-social-qr.component.html',
  styleUrl: './admin-social-qr.component.scss'
})
export class AdminSocialQrComponent extends BaseSocialQrComponent {
  private globalSearchService = inject(GlobalSearchService);

  async ngOnInit() {
    this.isLoading = true;

    await this.effects.fetchSocialQrs();

    this.globalSearchService.searchTerm$
      .subscribe(term => {
        this.searchTerm.set(term.toLowerCase().trim());
        this.pageIndex.set(0);
      });

    this.isLoading = false;
  }

  clearSearch() {
    this.searchTerm.set('');
    this.globalSearchService.setSearchTerm('');
  }

  reload() {
    this.isLoading = true;
    this.effects.fetchSocialQrs();
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

}