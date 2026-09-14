import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '../config/api-endpoint';
import {
  EntityMetadata,
  FormMetadata,
  ListMetadata,
  ListQuery,
  ListQueryResult,
  EntityLocateRequest,
  EntityLocateResult,
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

  locateEntity(resource: string, listId: string, request: EntityLocateRequest) {
    return this.http.post<EntityLocateResult>(
      this.api.url(`entities/${resource}/lists/${listId}/locate`),
      request,
    );
  }

  deleteEntity(resource: string, id: string | number) {
    return this.http.delete<void>(
      this.api.url(`entities/${resource}/${encodeURIComponent(String(id))}`),
    );
  }

  updateEntity(
    resource: string,
    id: string | number,
    value: Record<string, unknown>,
    projection?: string,
  ) {
    return this.http.patch<Record<string, unknown>>(
      this.api.url(`entities/${resource}/${encodeURIComponent(String(id))}`),
      value,
      projection ? { params: { projection } } : undefined,
    );
  }

  createEntity(resource: string, value: Record<string, unknown>, projection?: string) {
    return this.http.post<Record<string, unknown>>(
      this.api.url(`entities/${resource}`),
      value,
      projection ? { params: { projection } } : undefined,
    );
  }
}
