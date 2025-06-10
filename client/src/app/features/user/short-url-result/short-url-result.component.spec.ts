import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortUrlResultComponent } from './short-url-result.component';

describe('ShortUrlResultComponent', () => {
  let component: ShortUrlResultComponent;
  let fixture: ComponentFixture<ShortUrlResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortUrlResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortUrlResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
