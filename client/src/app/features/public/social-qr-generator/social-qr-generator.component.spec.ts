import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialQrGeneratorComponent } from './social-qr-generator.component';

describe('SocialQrGeneratorComponent', () => {
  let component: SocialQrGeneratorComponent;
  let fixture: ComponentFixture<SocialQrGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialQrGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialQrGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
