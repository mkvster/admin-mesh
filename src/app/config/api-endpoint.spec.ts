import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ApiEndpoint } from './api-endpoint';
import { ADMINMESH_CONFIG } from './adminmesh-config';

describe('ApiEndpoint', () => {
  let service: ApiEndpoint;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ADMINMESH_CONFIG, useValue: { apiBaseUrl: '/api', mockApi: true } }],
    });
    service = TestBed.inject(ApiEndpoint);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
