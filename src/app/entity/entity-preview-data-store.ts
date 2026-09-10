import { inject, Injectable } from '@angular/core';
import { AdminCache } from '../cache/admin-cache';
import { EntityApi } from './entity-api';

@Injectable({ providedIn: 'root' })
export class EntityPreviewDataStore {
  private readonly api = inject(EntityApi);
  private readonly cache = inject(AdminCache);

  get(resource: string, id: string | number, formId: string, projection?: string) {
    const key = [resource, id, formId, projection ?? ''].map(encodeURIComponent).join(':');
    return this.cache.entityPreview.getOrCreate(key, () =>
      this.api.getEntity(resource, id, projection),
    );
  }
}
