import { describe, expect, it } from 'vitest';
import { FilterItem } from '../entity-types';
import { parseListFilter, serializeListFilter } from './filter-serialization';

describe('filter serialization', () => {
  it('round-trips filters through a base64url opaque value', () => {
    const items: FilterItem[] = [
      { field: 'lastName', operator: 'contains', value: 'smith & Иван' },
      { field: 'email', operator: 'endsWith', value: '@example.com' },
    ];

    const serialized = serializeListFilter(items, { resource: 'customers', listId: 'main' });

    expect(serialized).not.toContain('{');
    expect(serialized).not.toContain('=');
    expect(parseListFilter(serialized, { resource: 'customers', listId: 'main' })).toEqual({
      operator: 'and',
      items,
    });
    expect(parseListFilter(serialized, { resource: 'products', listId: 'main' })).toBeUndefined();
  });

  it('rejects malformed or incomplete filters', () => {
    expect(parseListFilter('not-a-filter')).toBeUndefined();
  });

  it('round-trips typed scalar and range values', () => {
    const items: FilterItem[] = [
      { field: 'total', operator: 'greaterThanOrEqual', value: 100 },
      { field: 'enabled', operator: 'equals', value: false },
      { field: 'issueDate', operator: 'between', value: ['2026-08-01', '2026-08-31'] },
    ];

    expect(parseListFilter(serializeListFilter(items))).toEqual({ operator: 'and', items });
  });

  it('round-trips enum scalar and array values', () => {
    const items: FilterItem[] = [
      { field: 'status', operator: 'equals', value: 1 },
      { field: 'status', operator: 'in', value: ['draft', 'active'] },
      { field: 'status', operator: 'notIn', value: [3, 4] },
    ];

    expect(parseListFilter(serializeListFilter(items))).toEqual({ operator: 'and', items });
  });
});
