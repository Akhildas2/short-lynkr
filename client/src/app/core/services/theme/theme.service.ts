import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDark.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const saved = localStorage.getItem('theme');
    this.setDarkTheme(saved === 'dark');
  }

  setDarkTheme(isDark: boolean): void {
    this.isDark.next(isDark);
    const classList = this.document.body.classList;
    classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.setDarkTheme(!this.isDark.value);
  }

}
