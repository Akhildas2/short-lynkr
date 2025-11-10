import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSettingsEffects } from './state/settings/settings.effects';
import { NetworkService } from './core/services/network/network.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private settingsEffect: AdminSettingsEffects, private networkService: NetworkService) {
    effect(() => {
      const settings = this.settingsEffect['store'].settings();
      const appName = settings?.systemSettings?.appName || 'Short Lynkr';
      document.title = appName;
    });

  }

}