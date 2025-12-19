import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { UserPageHeaderComponent } from '../../../shared/components/ui/user-page-header/user-page-header.component';
import { ScrollButtonsComponent } from '../../../shared/components/ui/scroll-buttons/scroll-buttons.component';
import { BaseSocialQrComponent } from '../../../shared/base/base-social-qr.component';

@Component({
  selector: 'app-social-qr-list',
  imports: [SharedModule, EmptyStateComponent, SpinnerComponent, UserPageHeaderComponent, ScrollButtonsComponent],
  templateUrl: './social-qr-list.component.html',
  styleUrl: './social-qr-list.component.scss'
})
export class SocialQrListComponent extends BaseSocialQrComponent implements OnInit {

  async ngOnInit() {
    this.isLoading = true;
    await this.effects.fetchSocialQrs();
    this.isLoading = false;
  }

  clearSearch() {
    this.searchTerm.set('');
  }

}