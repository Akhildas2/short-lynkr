import { TestBed } from '@angular/core/testing';

import { SocialQrService } from './social-qr.service';

describe('SocialQrService', () => {
  let service: SocialQrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialQrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
