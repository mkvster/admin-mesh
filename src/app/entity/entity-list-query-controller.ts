import { computed, Injector, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, defer, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { FilterItem, ListQuery } from './entity-types';
import { ListPageChange, ListSortChange } from './list-grid/list-grid';
import {
  ResourceLoadState,
  ResourceLoadStateOptions,
  withResourceLoadState,
} from './resource-load-state';

export type EntityListQueryChange = 'page' | 'sort' | 'filter';

export interface EntityListQueryAdapter {
  readonly query: Signal<ListQuery | null>;
  update(query: ListQuery, change: EntityListQueryChange): void;
}

export interface EntityListQueryControllerOptions<T> {
  readonly adapter: EntityListQueryAdapter;
  readonly load: (query: ListQuery) => Observable<T>;
  readonly injector: Injector;
  readonly loadStateOptions?: ResourceLoadStateOptions;
}

export class EntityListQueryController<T> {
  private readonly refreshRequests = new Subject<void>();
  private readonly options: EntityListQueryControllerOptions<T>;

  readonly query: Signal<ListQuery | null>;
  readonly state: Signal<ResourceLoadState<T>>;
  readonly isLoading: Signal<boolean>;

  constructor(options: EntityListQueryControllerOptions<T>) {
    this.options = options;
    this.query = computed(() => this.options.adapter.query());
    this.state = toSignal(
      combineLatest([
        toObservable(this.query, { injector: this.options.injector }),
        this.refreshRequests.pipe(startWith(undefined)),
      ]).pipe(
        switchMap(([query]) => {
          if (query === null) {
            return of<ResourceLoadState<T>>({ status: 'loading' });
          }

          return defer(() => this.options.load(query)).pipe(
            withResourceLoadState(this.options.loadStateOptions),
          );
        }),
      ),
      {
        initialValue: { status: 'loading' } as ResourceLoadState<T>,
        injector: this.options.injector,
      },
    );
    this.isLoading = computed(() => this.state().status === 'loading');
  }

  setPage(change: ListPageChange): void {
    this.updateQuery((query) => ({ ...query, ...change }), 'page');
  }

  setSort(change: ListSortChange): void {
    this.updateQuery((query) => ({ ...query, page: 1, sort: change.sort }), 'sort');
  }

  setFilters(filters: FilterItem[]): void {
    this.updateQuery(
      (query) => ({
        ...query,
        page: 1,
        filter: filters.length ? { operator: 'and', items: filters } : undefined,
      }),
      'filter',
    );
  }

  clearFilters(): void {
    this.setFilters([]);
  }

  refresh(): void {
    this.refreshRequests.next();
  }

  private updateQuery(
    update: (query: ListQuery) => ListQuery,
    change: EntityListQueryChange,
  ): void {
    const query = this.query();
    if (query !== null) {
      this.options.adapter.update(update(query), change);
    }
  }
}
