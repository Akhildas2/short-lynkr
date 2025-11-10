import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedErrorLayoutComponent } from './shared-error-layout.component';

describe('SharedErrorLayoutComponent', () => {
  let component: SharedErrorLayoutComponent;
  let fixture: ComponentFixture<SharedErrorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedErrorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedErrorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
