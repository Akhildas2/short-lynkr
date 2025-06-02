import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUrlListComponent } from './my-url-list.component';

describe('MyUrlListComponent', () => {
  let component: MyUrlListComponent;
  let fixture: ComponentFixture<MyUrlListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUrlListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyUrlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
