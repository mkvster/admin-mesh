import { inject, Injectable } from '@angular/core';
import { EntityApi } from './entity-api';
import { AdminCache } from '../cache/admin-cache';

@Injectable({ providedIn: 'root' })
export class ListMetadataStore {
  private readonly api = inject(EntityApi);
  private readonly cache = inject(AdminCache);

  get(resource: string, listId: string) {
    return this.cache.listMetadata.getOrCreate(`${resource}:${listId}`, () =>
      this.api.getListMetadata(resource, listId),
    );
  }
}
