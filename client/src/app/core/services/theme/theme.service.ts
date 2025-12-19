import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) { }

  initTheme(mode: 'adminMode' | 'userMode') {
    const saved = localStorage.getItem(`${mode}-theme`);
    this.setDarkTheme(saved === 'dark', mode);
  }

  setDarkTheme(isDark: boolean, mode: 'adminMode' | 'userMode') {
    this.isDarkSubject.next(isDark);
    this.document.body.classList.toggle('dark', isDark);
    localStorage.setItem(`${mode}-theme`, isDark ? 'dark' : 'light');
  }

  toggleTheme(mode: 'adminMode' | 'userMode') {
    this.setDarkTheme(!this.isDarkSubject.value, mode);
  }
}