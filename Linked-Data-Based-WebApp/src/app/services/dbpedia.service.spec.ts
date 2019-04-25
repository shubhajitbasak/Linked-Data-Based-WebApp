import { TestBed, inject } from '@angular/core/testing';

import { DbpediaService } from './dbpedia.service';

describe('DbpediaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbpediaService]
    });
  });

  it('should be created', inject([DbpediaService], (service: DbpediaService) => {
    expect(service).toBeTruthy();
  }));
});
