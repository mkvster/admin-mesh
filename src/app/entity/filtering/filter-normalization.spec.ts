import { describe, expect, it } from 'vitest';
import { FilterItem } from '../entity-types';
import { normalizeFilterItems } from './filter-normalization';

describe('normalizeFilterItems', () => {
  it('removes exact duplicate conditions and preserves order', () => {
    const items: FilterItem[] = [
      { field: 'firstName', operator: 'contains', value: 'a' },
      { field: 'lastName', operator: 'contains', value: 'a' },
      { field: 'firstName', operator: 'contains', value: 'a' },
      { field: 'firstName', operator: 'contains', value: 'ab' }
    ];

    expect(normalizeFilterItems(items)).toEqual([
      items[0],
      items[1],
      items[3]
    ]);
  });

  it('compares structured values as complete values', () => {
    const items = [
      { field: 'total', operator: 'between' as const, value: [100, 500] },
      { field: 'total', operator: 'between' as const, value: [100, 500] },
      { field: 'total', operator: 'between' as const, value: [100, 600] }
    ];

    expect(normalizeFilterItems(items)).toEqual([items[0], items[2]]);
  });
});
