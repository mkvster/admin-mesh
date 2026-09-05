import { inject, Injectable } from '@angular/core';
import { EntityApi } from './entity-api';
import { AdminCache } from '../cache/admin-cache';

@Injectable({ providedIn: 'root' })
export class EntityMetadataStore {
  private readonly api = inject(EntityApi);
  private readonly cache = inject(AdminCache);

  get(resource: string) {
    return this.cache.entityMetadata.getOrCreate(resource, () => this.api.getMetadata(resource));
  }
}
