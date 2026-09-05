import { InjectionToken } from '@angular/core';

export interface AdminMeshConfig {
  apiBaseUrl: string;
  mockApi: boolean;
}

export const ADMINMESH_CONFIG = new InjectionToken<AdminMeshConfig>('ADMINMESH_CONFIG');
