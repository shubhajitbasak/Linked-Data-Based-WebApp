import { TestBed, inject } from '@angular/core/testing';

import { Nobel.PrizeService } from './nobel.prize.service';

describe('Nobel.PrizeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Nobel.PrizeService]
    });
  });

  it('should be created', inject([Nobel.PrizeService], (service: Nobel.PrizeService) => {
    expect(service).toBeTruthy();
  }));
});
