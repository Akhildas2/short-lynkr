import { Injectable } from '@angular/core';

export type RangeContext = 'user' | 'admin';
@Injectable({
  providedIn: 'root'
})
export class RangeService {
  private readonly storageKeys = {
    user: 'user-analytics-range',
    admin: 'admin-analytics-range'
  };
  private readonly defaultRange = '1d';

  getRange(context: RangeContext): string {
    try {
      const storageKey = this.storageKeys[context];
      return localStorage.getItem(storageKey) || this.defaultRange;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return this.defaultRange;
    }
  }

  setRange(context: RangeContext, range: string): void {
    try {
      const storageKey = this.storageKeys[context];
      localStorage.setItem(storageKey, range);
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }

  clearRange(context: RangeContext): void {
    try {
      const storageKey = this.storageKeys[context];
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }

  clearAllRanges(): void {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
}