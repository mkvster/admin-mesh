import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { EntityListQueryAdapter, EntityListQueryController } from './entity-list-query-controller';
import { ListQuery } from './entity-types';

function createController(
  initialQuery: ListQuery,
  load: (query: ListQuery) => Observable<string> = (query) => of(JSON.stringify(query)),
) {
  const query = signal<ListQuery | null>(initialQuery);
  const adapter: EntityListQueryAdapter = {
    query,
    update: (nextQuery) => query.set(nextQuery),
  };

  return {
    query,
    controller: runInInjectionContext(
      TestBed.inject(Injector),
      () =>
        new EntityListQueryController({
          adapter,
          load,
          injector: TestBed.inject(Injector),
        }),
    ),
  };
}

describe('EntityListQueryController', () => {
  it('updates page, sort, and filters through the adapter', async () => {
    const { query, controller } = createController({ page: 2, pageSize: 25 });

    controller.setPage({ page: 3, pageSize: 50 });
    expect(query()).toEqual({ page: 3, pageSize: 50 });

    controller.setSort({ sort: [{ field: 'name', direction: 'asc' }] });
    expect(query()).toEqual({
      page: 1,
      pageSize: 50,
      sort: [{ field: 'name', direction: 'asc' }],
    });

    controller.setFilters([{ field: 'name', operator: 'contains', value: 'Ada' }]);
    expect(query()).toEqual({
      page: 1,
      pageSize: 50,
      sort: [{ field: 'name', direction: 'asc' }],
      filter: {
        operator: 'and',
        items: [{ field: 'name', operator: 'contains', value: 'Ada' }],
      },
    });

    controller.clearFilters();
    expect(query()).toEqual({
      page: 1,
      pageSize: 50,
      sort: [{ field: 'name', direction: 'asc' }],
      filter: undefined,
    });
  });

  it('exposes loading and loaded states and supports refresh', async () => {
    const load = vi.fn((query: ListQuery) => of(JSON.stringify(query)));
    const { controller } = createController({ page: 1, pageSize: 25 }, load);

    await vi.waitFor(() => expect(controller.state().status).toBe('loaded'));
    expect(controller.state()).toMatchObject({
      status: 'loaded',
      data: '{"page":1,"pageSize":25}',
    });

    controller.refresh();
    await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });

  it('preserves load errors in the error state', async () => {
    const cause = new Error('failed');
    const { controller } = createController({ page: 1, pageSize: 25 }, () =>
      throwError(() => cause),
    );

    await vi.waitFor(() => expect(controller.state()).toEqual({ status: 'error', cause }));
  });

  it('does not load while the adapter has no query', async () => {
    const load = vi.fn(() => of('loaded'));
    const { query, controller } = createController({ page: 1, pageSize: 25 }, load);

    await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    query.set(null);
    await vi.waitFor(() => expect(controller.state()).toEqual({ status: 'loading' }));
    expect(load).toHaveBeenCalledTimes(1);
  });
});
