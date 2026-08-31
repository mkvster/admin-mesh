import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NavigationResponse } from './navigation-types';
import { ApiEndpoint } from '../config/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class NavigationApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiEndpoint);

  getNavigation() {
    return this.http.get<NavigationResponse>(this.api.url('navigation'));
  }
}
