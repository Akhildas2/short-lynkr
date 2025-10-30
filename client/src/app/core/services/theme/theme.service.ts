import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const saved = localStorage.getItem('theme');
    this.setDarkTheme(saved === 'dark');
  }

  setDarkTheme(isDark: boolean) {
    this.isDarkSubject.next(isDark);
    this.document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.setDarkTheme(!this.isDarkSubject.value);
  }
}