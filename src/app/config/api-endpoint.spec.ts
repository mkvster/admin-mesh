import { TestBed } from '@angular/core/testing';

import { ApiEndpoint } from './api-endpoint';

describe('ApiEndpoint', () => {
  let service: ApiEndpoint;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiEndpoint);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
