import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialQrListComponent } from './social-qr-list.component';

describe('SocialQrListComponent', () => {
  let component: SocialQrListComponent;
  let fixture: ComponentFixture<SocialQrListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialQrListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialQrListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
