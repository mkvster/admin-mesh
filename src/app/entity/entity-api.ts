import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '../config/api-endpoint';
import {
  EntityMetadata,
  FormMetadata,
  ListMetadata,
  ListQuery,
  ListQueryResult,
} from './entity-types';

@Injectable({ providedIn: 'root' })
export class EntityApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiEndpoint);

  getMetadata(resource: string) {
    return this.http.get<EntityMetadata>(this.api.url(`entities/${resource}/metadata`));
  }

  getListMetadata(resource: string, listId: string) {
    return this.http.get<ListMetadata>(
      this.api.url(`entities/${resource}/lists/${listId}/metadata`),
    );
  }

  getFormMetadata(resource: string, formId: string) {
    return this.http.get<FormMetadata>(
      this.api.url(`entities/${resource}/forms/${encodeURIComponent(formId)}/metadata`),
    );
  }

  getEntity(resource: string, id: string | number, projection?: string) {
    return this.http.get<Record<string, unknown>>(
      this.api.url(`entities/${resource}/${encodeURIComponent(String(id))}`),
      projection ? { params: { projection } } : undefined,
    );
  }

  queryList(resource: string, listId: string, query: ListQuery) {
    return this.http.post<ListQueryResult>(
      this.api.url(`entities/${resource}/lists/${listId}/query`),
      query,
    );
  }

  deleteEntity(resource: string, id: string | number) {
    return this.http.delete<void>(
      this.api.url(`entities/${resource}/${encodeURIComponent(String(id))}`),
    );
  }
}
