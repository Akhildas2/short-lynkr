import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-scroll-buttons',
  imports: [SharedModule],
  templateUrl: './scroll-buttons.component.html',
  styleUrl: './scroll-buttons.component.scss'
})
export class ScrollButtonsComponent implements OnInit {
  @Input() isLoading: boolean = false;
  showScrollUp: boolean = false;
  showScrollDown: boolean = true;
  private lastScrollTop = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const container = document.querySelector('.mat-sidenav-content');
    if (container) {
      container.addEventListener('scroll', () => this.updateButton(container));
    } else {
      window.addEventListener('scroll', () => this.updateButton(window));
    }
  }

  // For scroll page
  scrollTo(direction: 'up' | 'down') {
    const container = document.querySelector('.mat-sidenav-content');

    if (container) {
      if (direction === 'up') {
        container.scrollTo({ top: 0, behavior: 'smooth' });
        this.showScrollUp = false;
        this.showScrollDown = true;
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        this.showScrollUp = true;
        this.showScrollDown = false;
      }
    } else {
      if (direction === 'up') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showScrollUp = false;
        this.showScrollDown = true;
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        this.showScrollUp = true;
        this.showScrollDown = false;
      }
    }
  }

  // Update scroll button
  public updateButton(target: any) {
    const scrollTop = target === window ? window.scrollY : target.scrollTop;

    if (scrollTop > this.lastScrollTop) {
      this.showScrollUp = true;
      this.showScrollDown = false;
    } else {
      this.showScrollUp = false;
      this.showScrollDown = true;
    }

    this.lastScrollTop = scrollTop;
    this.cdr.detectChanges();
  }


}