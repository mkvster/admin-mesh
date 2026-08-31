import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '../config/api-endpoint';
import { EntityMetadata, ListMetadata, ListQuery, ListQueryResult } from './entity-types';

@Injectable({ providedIn: 'root' })
export class EntityApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiEndpoint);

  getMetadata(resource: string) {
    return this.http.get<EntityMetadata>(
      this.api.url(`entities/${resource}/metadata`)
    );
  }

  getListMetadata(resource: string, listId: string) {
    return this.http.get<ListMetadata>(
      this.api.url(`entities/${resource}/lists/${listId}/metadata`)
    );
  } 

  queryList(resource: string, listId: string, query: ListQuery) {
    return this.http.post<ListQueryResult>(
      this.api.url(`entities/${resource}/lists/${listId}/query`),
      query
    );
  }  
}
