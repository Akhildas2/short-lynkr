import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSettingsEffects } from './state/settings/settings.effects';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private settingsEffects: AdminSettingsEffects) {
    this.settingsEffects.loadSettings();

    effect(() => {
      document.title = this.settingsEffects.appName();
    });
  }

}