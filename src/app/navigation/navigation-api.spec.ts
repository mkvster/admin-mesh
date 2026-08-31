import { TestBed } from '@angular/core/testing';

import { NavigationApi } from './navigation-api';

describe('NavigationApi', () => {
  let service: NavigationApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
