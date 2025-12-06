import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialQrDialogComponent } from './social-qr-dialog.component';

describe('SocialQrDialogComponent', () => {
  let component: SocialQrDialogComponent;
  let fixture: ComponentFixture<SocialQrDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialQrDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialQrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
