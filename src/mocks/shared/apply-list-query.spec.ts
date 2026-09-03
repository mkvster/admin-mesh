import { applyListQuery } from './apply-list-query';
import { describe, expect, it } from 'vitest';

describe('applyListQuery filters', () => {
  const rows = [
    { id: 1, name: 'Red Apple Juice', code: 'APPLE-1' },
    { id: 2, name: 'Green Apple', code: 'APPLE-2' },
    { id: 3, name: 'Orange Juice', code: 'JUICE-1' }
  ];

  it('supports the four case-insensitive string operators', () => {
    expect(applyListQuery(rows, query('contains', 'apple')).items.map(row => row.id)).toEqual([1, 2]);
    expect(applyListQuery(rows, query('equals', 'green apple')).items.map(row => row.id)).toEqual([2]);
    expect(applyListQuery(rows, query('startsWith', 'red')).items.map(row => row.id)).toEqual([1]);
    expect(applyListQuery(rows, query('endsWith', 'JUICE')).items.map(row => row.id)).toEqual([1, 3]);
  });

  it('combines conditions with AND before sorting, counting, and paging', () => {
    const result = applyListQuery(rows, {
      page: 1,
      pageSize: 1,
      filter: {
        operator: 'and',
        items: [
          { field: 'name', operator: 'contains', value: 'apple' },
          { field: 'code', operator: 'endsWith', value: '2' }
        ]
      },
      sort: [{ field: 'name', direction: 'desc' }]
    });

    expect(result.totalCount).toBe(1);
    expect(result.items.map(row => row.id)).toEqual([2]);
  });
});

function query(operator: 'contains' | 'equals' | 'startsWith' | 'endsWith', value: string) {
  return {
    page: 1,
    pageSize: 25,
    filter: {
      operator: 'and' as const,
      items: [{ field: 'name', operator, value }]
    }
  };
}
