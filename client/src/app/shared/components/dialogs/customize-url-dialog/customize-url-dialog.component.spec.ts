import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeUrlDialogComponent } from './customize-url-dialog.component';

describe('CustomizeUrlDialogComponent', () => {
  let component: CustomizeUrlDialogComponent;
  let fixture: ComponentFixture<CustomizeUrlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomizeUrlDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomizeUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
