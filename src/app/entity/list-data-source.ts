import { inject, Injectable } from '@angular/core';
import { combineLatest, map, switchMap } from 'rxjs';
import { EntityApi } from './entity-api';
import { EntityMetadataStore } from './entity-metadata-store';
import { FieldMetadataResolver } from './field-metadata-resolver';
import { ListMetadataStore } from './list-metadata-store';
import { EntityMetadata, ListMetadata, ListQuery, ListQueryResult } from './entity-types';

export interface ListData {
  entityMetadata: EntityMetadata;
  metadata: ListMetadata;
  result: ListQueryResult;
}

@Injectable({ providedIn: 'root' })
export class ListDataSource {
  private readonly api = inject(EntityApi);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly listMetadataStore = inject(ListMetadataStore);
  private readonly fieldMetadataResolver = inject(FieldMetadataResolver);

  load(resource: string, listId: string, query: ListQuery) {
    return combineLatest([
      this.entityMetadataStore.get(resource),
      this.listMetadataStore.get(resource, listId),
    ]).pipe(
      map(([entityMetadata, listMetadata]) => ({
        entityMetadata,
        metadata: {
          ...listMetadata,
          fields: this.fieldMetadataResolver.mergeFields(
            entityMetadata.fields,
            listMetadata.fields,
          ),
        },
      })),
      switchMap((list) =>
        this.api.queryList(resource, listId, query).pipe(map((result) => ({ ...list, result }))),
      ),
    );
  }
}
