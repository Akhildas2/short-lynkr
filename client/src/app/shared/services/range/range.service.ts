import { Injectable } from '@angular/core';

export type RangeContext = 'user' | 'admin' | 'dashboard';
@Injectable({
  providedIn: 'root'
})
export class RangeService {
  private readonly storageKeys = {
    user: 'user-analytics-range',
    admin: 'admin-analytics-range',
    dashboard: 'admin-dashboard'
  };
  private readonly defaultRange = '1d';
  
  getRange(context: RangeContext): string {
    const storageKey = this.storageKeys[context];
    return localStorage.getItem(storageKey) || this.defaultRange;
  }

  setRange(context: RangeContext, range: string): void {
    const storageKey = this.storageKeys[context];
    localStorage.setItem(storageKey, range);
  }

  clearRange(context: RangeContext): void {
    const storageKey = this.storageKeys[context];
    localStorage.removeItem(storageKey);
  }

  clearAllRanges(): void {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  }

}