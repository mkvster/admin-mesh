import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, startWith, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityApi } from './entity-api';
import { EntityMetadataStore } from './entity-metadata-store';
import { ListMetadataStore } from './list-metadata-store';

import { EntityMetadata, ListMetadata, ListQueryResult } from './entity-types';
import { ListGrid } from './list-grid';


type EntityListState =
  | { status: 'loading' }
  | {
      status: 'loaded';
      resource: string;
      metadata: EntityMetadata;
      listMetadata: ListMetadata;
      data: ListQueryResult;
    }
  | { status: 'error'; message: string };


@Component({
  selector: 'app-entity-list',
  imports: [
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    ListGrid
  ],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss'
})
export class EntityList {
  readonly resource = input.required<string>();

  private readonly api = inject(EntityApi);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly listMetadataStore = inject(ListMetadataStore);

  readonly state = toSignal(
    toObservable(this.resource).pipe(
      switchMap(resource =>
        this.loadEntityList(resource).pipe(
          startWith({ status: 'loading' } as EntityListState)
        )
      )
    ),
    {
      initialValue: { status: 'loading' } as EntityListState
    }
  );

  private loadEntityList(resource: string) {
    // Load entity metadata first, then load list metadata and initial data
    return this.entityMetadataStore.get(resource).pipe(
      switchMap(metadata =>
        this.loadList(resource, metadata)
      ),
      catchError(error => this.handleLoadError(error))
    );
  }

  private loadList(resource: string, metadata: EntityMetadata) {
    const listId = metadata.views.list;

    // Load list metadata and initial data in parallel
    return forkJoin({
      listMetadata: this.loadListMetadata(resource, listId),
      data: this.loadInitialData(resource, listId)
    }).pipe(
      map(({ listMetadata, data }) => ({
        status: 'loaded',
        resource,
        metadata,
        listMetadata,
        data
      }) as EntityListState)
    );
  }

  private loadListMetadata(resource: string, listId: string) {
    return this.listMetadataStore.get(resource, listId);
  }

  private loadInitialData(resource: string, listId: string) {
    return this.api.queryList(
      resource,
      listId,
      {
        page: 1,
        pageSize: 25
      }
    );
  }

  private handleLoadError(error: any) {
    console.error('Entity list loading failed', error);

    return of<EntityListState>({
      status: 'error',
      message: 'Failed to load entity list'
    });
  }  
}
