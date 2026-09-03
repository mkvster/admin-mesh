import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, defer, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EntityApi } from './entity-api';
import { EntityMetadataStore } from './entity-metadata-store';
import { ListMetadataStore } from './list-metadata-store';

import { EntityMetadata, FilterItem, ListMetadata, ListQuery, ListQueryResult, ListSort } from './entity-types';
import { ListGrid, ListPageChange, ListSortChange } from './list-grid';
import { FilterDialog } from './filtering/filter-dialog/filter-dialog';
import { MAX_SERIALIZED_FILTER_LENGTH } from './filtering/filter-constraints';
import { parseListFilter, serializeListFilter } from './filtering/filter-serialization';


type EntityListState =
  | { status: 'loading' }
  | {
      status: 'loaded';
      resource: string;
      metadata: EntityMetadata;
      listMetadata: ListMetadata;
      data: ListQueryResult;
      page: number;
      pageSize: number;
      sort: ListSort[];
      filters: FilterItem[];
    }
  | { status: 'error'; message: string };


@Component({
  selector: 'app-entity-list',
  imports: [
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    MatButtonModule,
    ListGrid
  ],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityList {
  readonly resource = input.required<string>();

  private readonly api = inject(EntityApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly listMetadataStore = inject(ListMetadataStore);
  private listRequestVersion = 0;

  readonly isListLoading = signal(true);

  readonly state = toSignal<EntityListState, EntityListState>(
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
    this.isListLoading.set(true);

    return this.entityMetadataStore.get(resource).pipe(
      switchMap(metadata =>
        this.loadList(resource, metadata)
      ),
      catchError(error => this.handleLoadError(error))
    );
  }

  private loadList(resource: string, metadata: EntityMetadata) {
    const listId = metadata.views.list;

    return this.loadListMetadata(resource, listId).pipe(
      switchMap(listMetadata =>
        this.route.queryParamMap.pipe(
            map(params => this.readListQuery(params, resource, listId)),
          tap(query => this.ensurePagingParams(query)),
          switchMap(query => {
            const requestVersion = ++this.listRequestVersion;
            this.isListLoading.set(true);

            return defer(() => this.api.queryList(resource, listId, query)).pipe(
              finalize(() => {
                if (requestVersion === this.listRequestVersion) {
                  this.isListLoading.set(false);
                }
              }),
              map(data => ({
                status: 'loaded',
                resource,
                metadata,
                listMetadata,
                data,
                page: query.page,
                pageSize: query.pageSize,
                sort: query.sort ?? [],
                filters: query.filter?.items ?? []
              }) as EntityListState)
            );
          })
        )
      )
    );
  }

  private loadListMetadata(resource: string, listId: string) {
    return this.listMetadataStore.get(resource, listId);
  }

  protected onPageChange(event: ListPageChange): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: event,
      queryParamsHandling: 'merge'
    });
  }

  protected onSortChange(event: ListSortChange): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        sort: this.serializeSort(event.sort),
        dir: null
      },
      queryParamsHandling: 'merge'
    });
  }

  protected openFilters(state: Extract<EntityListState, { status: 'loaded' }>): void {
    const dialogRef = this.dialog.open(FilterDialog, {
      width: 'min(900px, 90vw)',
      maxWidth: '95vw',
      maxHeight: 'calc(100vh - 24px)',
      data: {
        fields: state.listMetadata.fields,
        filters: state.filters,
        scope: {
          resource: state.resource,
          listId: state.metadata.views.list
        }
      }
    });

    dialogRef.afterClosed().subscribe(filters => {
      if (filters === undefined) {
        return;
      }

      const serializedFilter = filters.length
        ? serializeListFilter(filters, {
          resource: state.resource,
          listId: state.metadata.views.list
        })
        : null;

      if (serializedFilter && serializedFilter.length > MAX_SERIALIZED_FILTER_LENGTH) {
        return;
      }

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: 1,
          filter: serializedFilter,
          filters: null
        },
        queryParamsHandling: 'merge'
      });
    });
  }

  protected clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        filter: null,
        filters: null
      },
      queryParamsHandling: 'merge'
    });
  }

  protected filterCountLabel(count: number): string {
    return count > 9 ? '9+' : String(count);
  }

  private readListQuery(params: ParamMap, resource: string, listId: string): ListQuery {
    const page = this.readPositiveInt(params.get('page'), 1);
    const pageSize = this.readPositiveInt(params.get('pageSize'), 25);
    const sort = this.parseSort(params.get('sort'), params.get('dir'));
    const filters = parseListFilter(params.get('filter'), { resource, listId })?.items ?? [];

    return {
      page,
      pageSize,
      ...(sort.length ? { sort } : {}),
      ...(filters.length ? { filter: { operator: 'and', items: filters } } : {})
    };
  }

  private parseSort(value: string | null, legacyDirection: string | null): ListSort[] {
    if (!value) {
      return [];
    }

    const parsed = value.split(',')
      .map(part => {
        const [field, direction] = part.split(':');
        return field && (direction === 'asc' || direction === 'desc')
          ? { field, direction }
          : undefined;
      })
      .filter((item): item is ListSort => item !== undefined);

    // Keep links using the previous sort=field&dir=direction format working.
    if (parsed.length === 0 && legacyDirection &&
        (legacyDirection === 'asc' || legacyDirection === 'desc')) {
      return [{ field: value, direction: legacyDirection }];
    }

    return parsed;
  }

  private serializeSort(sort: ListSort[]): string | null {
    return sort.length
      ? sort.map(item => `${item.field}:${item.direction}`).join(',')
      : null;
  }

  private readPositiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private ensurePagingParams(query: ListQuery): void {
    const params = this.route.snapshot.queryParamMap;

    if (params.get('page') === String(query.page) &&
        params.get('pageSize') === String(query.pageSize)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: query.page,
        pageSize: query.pageSize
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private handleLoadError(error: unknown) {
    console.error('Entity list loading failed', error);
    this.isListLoading.set(false);

    return of<EntityListState>({
      status: 'error',
      message: 'Failed to load entity list'
    });
  }  
}
