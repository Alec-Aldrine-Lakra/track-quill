import { TestBed } from '@angular/core/testing';

import { VerhistoryService } from './verhistory.service';

describe('VerhistoryService', () => {
  let service: VerhistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerhistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
