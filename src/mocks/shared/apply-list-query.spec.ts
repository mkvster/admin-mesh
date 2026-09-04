import { applyListQuery } from './apply-list-query';
import { describe, expect, it } from 'vitest';

describe('applyListQuery filters', () => {
  const rows = [
    { id: 1, name: 'Red Apple Juice', code: 'APPLE-1' },
    { id: 2, name: 'Green Apple', code: 'APPLE-2' },
    { id: 3, name: 'Orange Juice', code: 'JUICE-1' }
  ];

  it('supports the four case-insensitive string operators', () => {
    expect(applyListQuery(rows, query('contains', 'apple')).items.map(row => row['id'])).toEqual([1, 2]);
    expect(applyListQuery(rows, query('equals', 'green apple')).items.map(row => row['id'])).toEqual([2]);
    expect(applyListQuery(rows, query('startsWith', 'red')).items.map(row => row['id'])).toEqual([1]);
    expect(applyListQuery(rows, query('endsWith', 'JUICE')).items.map(row => row['id'])).toEqual([1, 3]);
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
    expect(result.items.map(row => row['id'])).toEqual([2]);
  });

  it('compares numeric values as numbers and includes between boundaries', () => {
    const numericRows = [
      { id: 1, total: 10 },
      { id: 2, total: 100 },
      { id: 3, total: 500 },
      { id: 4, total: 1000 }
    ];

    expect(applyListQuery(numericRows, typedQuery('greaterThanOrEqual', 100)).items.map(row => row['id']))
      .toEqual([2, 3, 4]);
    expect(applyListQuery(numericRows, typedQuery('between', [100, 500])).items.map(row => row['id']))
      .toEqual([2, 3]);
    expect(applyListQuery(numericRows, typedQuery('notEquals', 100)).items.map(row => row['id']))
      .toEqual([1, 3, 4]);
    expect(applyListQuery(numericRows, typedQuery('greaterThan', 100)).items.map(row => row['id']))
      .toEqual([3, 4]);
    expect(applyListQuery(numericRows, typedQuery('lessThan', 500)).items.map(row => row['id']))
      .toEqual([1, 2]);
    expect(applyListQuery(numericRows, typedQuery('lessThanOrEqual', 500)).items.map(row => row['id']))
      .toEqual([1, 2, 3]);
    expect(applyListQuery(numericRows, typedQuery('equals', 100)).items.map(row => row['id']))
      .toEqual([2]);
  });

  it('supports boolean filtering', () => {
    const booleanRows = [{ id: 1, enabled: true }, { id: 2, enabled: false }];

    expect(applyListQuery(booleanRows, typedQuery('equals', true, 'enabled')).items.map(row => row['id'])).toEqual([1]);
    expect(applyListQuery(booleanRows, typedQuery('equals', false, 'enabled')).items.map(row => row['id'])).toEqual([2]);
  });

  it('compares date and datetime values as parsed dates with inclusive ranges', () => {
    const dateRows = [
      { id: 1, issueDate: '2026-08-01' },
      { id: 2, issueDate: '2026-08-15' },
      { id: 3, issueDate: '2026-08-31' }
    ];
    const datetimeRows = [
      { id: 1, paymentDate: '2026-09-03T13:00:00.000Z' },
      { id: 2, paymentDate: '2026-09-03T14:30:00.000Z' },
      { id: 3, paymentDate: '2026-09-03T16:00:00.000Z' }
    ];

    expect(applyListQuery(dateRows, typedQuery('between', ['2026-08-01', '2026-08-31'], 'issueDate')).items.map(row => row['id']))
      .toEqual([1, 2, 3]);
    expect(applyListQuery(datetimeRows, typedQuery('after', '2026-09-03T14:30:00.000Z', 'paymentDate')).items.map(row => row['id']))
      .toEqual([3]);
  });

  it('evaluates relative past datetime filters at query time', () => {
    const now = Date.now();
    const datetimeRows = [
      { id: 1, paymentDate: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
      { id: 2, paymentDate: new Date(now - 30 * 60 * 1000).toISOString() }
    ];

    expect(applyListQuery(datetimeRows, typedQuery('inThePast', 'hour', 'paymentDate')).items.map(row => row['id']))
      .toEqual([2]);
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

function typedQuery(operator: 'equals' | 'notEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between' | 'after' | 'inThePast', value: string | number | boolean | [string | number, string | number], field = 'total') {
  return {
    page: 1,
    pageSize: 25,
    filter: {
      operator: 'and' as const,
      items: [{ field, operator, value }]
    }
  };
}
