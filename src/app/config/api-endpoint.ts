import { inject, Injectable } from '@angular/core';
import { ADMINMESH_CONFIG } from './adminmesh-config';
import { normalizeUrlPath } from '../shared/api-url';

@Injectable({
  providedIn: 'root',
})
export class ApiEndpoint {
  private readonly config = inject(ADMINMESH_CONFIG);

  url(path: string): string {
    return `${this.config.apiBaseUrl}/${normalizeUrlPath(path)}`;
  }
}
