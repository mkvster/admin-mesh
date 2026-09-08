import { inject, Injectable } from '@angular/core';
import { AdminCache } from '../cache/admin-cache';
import { EntityApi } from './entity-api';

@Injectable({ providedIn: 'root' })
export class FormMetadataStore {
  private readonly api = inject(EntityApi);
  private readonly cache = inject(AdminCache);

  get(resource: string, formId: string) {
    return this.cache.formMetadata.getOrCreate(`${resource}:${formId}`, () =>
      this.api.getFormMetadata(resource, formId),
    );
  }
}
