import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { NavigationApi } from './navigation-api';
import { ADMINMESH_CONFIG } from '../config/adminmesh-config';

describe('NavigationApi', () => {
  let service: NavigationApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ADMINMESH_CONFIG, useValue: { apiBaseUrl: '/api', mockApi: true } }],
    });
    service = TestBed.inject(NavigationApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
