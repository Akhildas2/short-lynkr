import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlsManagementComponent } from './urls-management.component';

describe('UrlsManagementComponent', () => {
  let component: UrlsManagementComponent;
  let fixture: ComponentFixture<UrlsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
