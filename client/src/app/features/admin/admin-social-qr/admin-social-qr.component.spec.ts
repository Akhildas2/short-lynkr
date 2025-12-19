import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSocialQrComponent } from './admin-social-qr.component';

describe('AdminSocialQrComponent', () => {
  let component: AdminSocialQrComponent;
  let fixture: ComponentFixture<AdminSocialQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSocialQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSocialQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
