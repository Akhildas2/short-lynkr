import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSettingsEffects } from './state/settings/settings.effects';
import { AuthSocketService } from './core/services/socket/auth-socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private settingsEffects: AdminSettingsEffects, private socketAuth: AuthSocketService) {
    this.settingsEffects.loadSettings();

    effect(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        document.title = this.settingsEffects.appName();
      }
    });
  }

}