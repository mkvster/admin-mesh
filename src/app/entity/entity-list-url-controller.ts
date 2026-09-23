import { Injector, Signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { AsyncErrorHandler } from '../shared/async-error-handler';
import { EntityListQueryAdapter, EntityListQueryChange } from './entity-list-query-controller';
import { EntityMetadataStore } from './entity-metadata-store';
import { MAX_SERIALIZED_FILTER_LENGTH } from './filtering/filter-constraints';
import { parseListFilter, serializeListFilter } from './filtering/filter-serialization';
import { DEFAULT_PAGE_SIZE, normalizePageNumber, normalizePageSize } from './pagination';
import {
  EntityFormMode,
  EntityMetadata,
  FilterItem,
  ListQuery,
  ListQueryResult,
  ListSort,
} from './entity-types';

export interface EntityListUrlControllerOptions {
  readonly resource: Signal<string>;
  readonly route: ActivatedRoute;
  readonly router: Router;
  readonly metadataStore: EntityMetadataStore;
  readonly asyncErrorHandler: AsyncErrorHandler;
  readonly injector: Injector;
}

export class EntityListUrlController implements EntityListQueryAdapter {
  private readonly queryParams: Signal<ParamMap>;
  private readonly listId: Signal<string | null>;

  readonly query: Signal<ListQuery | null>;
  readonly formMode: Signal<EntityFormMode | null>;
  readonly filterMode: Signal<boolean>;
  readonly formEntityId: Signal<string | undefined>;

  constructor(private readonly options: EntityListUrlControllerOptions) {
    this.queryParams = toSignal(this.options.route.queryParamMap, {
      initialValue: this.options.route.snapshot.queryParamMap,
      injector: this.options.injector,
    });
    this.listId = toSignal(
      toObservable(this.options.resource, { injector: this.options.injector }).pipe(
        switchMap((resource) =>
          this.options.metadataStore.get(resource).pipe(map((metadata) => metadata.views.list)),
        ),
      ),
      { initialValue: null, injector: this.options.injector },
    );
    this.query = computed(() => {
      return this.readListQuery(this.queryParams(), this.options.resource(), this.listId());
    });
    this.formMode = computed<EntityFormMode | null>(() => {
      const mode = this.queryParams().get('entityMode');
      return mode === 'create' ? mode : null;
    });
    this.filterMode = computed(() => this.queryParams().get('filterMode') === 'true');
    this.formEntityId = computed(() => this.queryParams().get('entityId') ?? undefined);
  }

  currentUrl(): string {
    return this.options.router.url;
  }

  update(query: ListQuery, change: EntityListQueryChange): void {
    const listId = this.listId();
    const serializedFilter =
      listId !== null && query.filter?.items.length
        ? serializeListFilter(query.filter.items, {
            resource: this.options.resource(),
            listId,
          })
        : null;

    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: {
          page: query.page,
          pageSize: query.pageSize,
          sort: this.serializeSort(query.sort ?? []),
          dir: null,
          filter: serializedFilter,
          filters: null,
          filterMode: null,
        },
        queryParamsHandling: 'merge',
      }),
      this.queryNavigationError(change),
    );
  }

  ensurePagingParams(query: ListQuery): void {
    const params = this.options.route.snapshot.queryParamMap;
    if (
      params.get('page') === String(query.page) &&
      params.get('pageSize') === String(query.pageSize)
    ) {
      return;
    }

    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { page: query.page, pageSize: query.pageSize },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
      'Entity list paging normalization failed',
    );
  }

  ensureValidPage(query: ListQuery, data: ListQueryResult): void {
    const lastPage = Math.max(1, Math.ceil(data.totalCount / query.pageSize));
    if (query.page <= lastPage) return;

    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { page: lastPage },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
      'Entity list page correction failed',
    );
  }

  navigateToPage(page: number): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      }),
      'Saved entity page navigation failed',
    );
  }

  navigateToSavedRecord(resource: string, metadata: EntityMetadata, id: string | number): void {
    const filter = serializeListFilter(
      [{ field: metadata.idField, operator: 'equals', value: id }],
      { resource, listId: metadata.views.list },
    );
    if (filter.length > MAX_SERIALIZED_FILTER_LENGTH) return;

    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { page: 1, filter },
        queryParamsHandling: 'merge',
      }),
      'Saved entity search navigation failed',
    );
  }

  openEdit(id: string | number, contextToken: string): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate(['.', id, 'edit'], {
        relativeTo: this.options.route,
        queryParams: {},
        state: { entityListContextToken: contextToken },
      }),
      'Entity edit navigation failed',
    );
  }

  openForm(mode: 'edit' | 'create', id?: string | number): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { entityMode: mode, entityId: id ?? null },
        queryParamsHandling: 'merge',
      }),
      'Entity form navigation failed',
    );
  }

  closeForm(): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { entityMode: null, entityId: null },
        queryParamsHandling: 'merge',
      }),
      'Entity form closing failed',
    );
  }

  openFilterEditor(): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { filterMode: 'true' },
        queryParamsHandling: 'merge',
      }),
      'Entity list filter editor navigation failed',
    );
  }

  closeFilterEditor(): void {
    this.options.asyncErrorHandler.run(
      this.options.router.navigate([], {
        relativeTo: this.options.route,
        queryParams: { filterMode: null },
        queryParamsHandling: 'merge',
      }),
      'Entity list filter editor closing failed',
    );
  }

  private readListQuery(params: ParamMap, resource: string, listId: string | null): ListQuery {
    const page = normalizePageNumber(this.readPositiveInt(params.get('page'), 1));
    const pageSize = normalizePageSize(
      this.readPositiveInt(params.get('pageSize'), DEFAULT_PAGE_SIZE),
    );
    const sort = this.parseSort(params.get('sort'), params.get('dir'));
    const filters = listId
      ? (parseListFilter(params.get('filter'), { resource, listId })?.items ?? [])
      : [];

    return {
      page,
      pageSize,
      ...(sort.length ? { sort } : {}),
      ...(filters.length ? { filter: { operator: 'and', items: filters } } : {}),
    };
  }

  private parseSort(value: string | null, legacyDirection: string | null): ListSort[] {
    if (!value) return [];

    const parsed = value
      .split(',')
      .map((part) => {
        const [field, direction] = part.split(':');
        return field && (direction === 'asc' || direction === 'desc')
          ? { field, direction }
          : undefined;
      })
      .filter((item): item is ListSort => item !== undefined);

    if (
      parsed.length === 0 &&
      legacyDirection &&
      (legacyDirection === 'asc' || legacyDirection === 'desc')
    ) {
      return [{ field: value, direction: legacyDirection }];
    }

    return parsed;
  }

  private serializeSort(sort: ListSort[]): string | null {
    return sort.length ? sort.map((item) => `${item.field}:${item.direction}`).join(',') : null;
  }

  private readPositiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private queryNavigationError(change: EntityListQueryChange): string {
    return change === 'page'
      ? 'Entity list page navigation failed'
      : change === 'sort'
        ? 'Entity list sorting navigation failed'
        : 'Entity list filter navigation failed';
  }
}
