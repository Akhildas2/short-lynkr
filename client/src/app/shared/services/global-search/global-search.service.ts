import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private searchTermSubject = new BehaviorSubject<string>('');
  public searchTerm$: Observable<string> = this.searchTermSubject.asObservable().pipe(
    debounceTime(300), // Debounce for 300ms to avoid excessive API calls
    distinctUntilChanged() // Only emit if the search term has actually changed
  );

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  get currentSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  clearSearchTerm(): void {
    this.searchTermSubject.next('');
  }

}