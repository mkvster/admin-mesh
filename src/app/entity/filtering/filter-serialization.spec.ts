import { describe, expect, it } from 'vitest';
import { FilterItem } from './entity-types';
import { parseListFilter, serializeListFilter } from './filter-serialization';

describe('filter serialization', () => {
  it('round-trips filters through a base64url opaque value', () => {
    const items: FilterItem[] = [
      { field: 'lastName', operator: 'contains', value: 'smith & Иван' },
      { field: 'email', operator: 'endsWith', value: '@example.com' }
    ];

    const serialized = serializeListFilter(items, { resource: 'customers', listId: 'main' });

    expect(serialized).not.toContain('{');
    expect(serialized).not.toContain('=');
    expect(parseListFilter(serialized, { resource: 'customers', listId: 'main' }))
      .toEqual({ operator: 'and', items });
    expect(parseListFilter(serialized, { resource: 'products', listId: 'main' })).toBeUndefined();
  });

  it('rejects malformed or incomplete filters', () => {
    expect(parseListFilter('not-a-filter')).toBeUndefined();
  });
});
