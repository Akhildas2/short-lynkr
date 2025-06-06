import { TestBed } from '@angular/core/testing';

import { UrlDialogService } from './url-dialog.service';

describe('UrlDialogService', () => {
  let service: UrlDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
