import { FilterItem, ListQuery, ListQueryResult, ListSort } from '../../app/entity/entity-types';

export function applyListQuery(
  rows: Record<string, unknown>[],
  query: ListQuery
): ListQueryResult {
  let result = [...rows];

  const filters = query.filter?.items.filter(item => item.value.trim().length > 0) ?? [];
  if (filters.length) {
    result = result.filter(row => filters.every(item => matchesFilter(row, item)));
  }

  if (query.sort?.length) {
    result.sort((a, b) => compareRows(a, b, query.sort!));
  }

  const totalCount = result.length;
  const start = (query.page - 1) * query.pageSize;

  result = result.slice(start, start + query.pageSize);

  return {
    items: result,
    totalCount
  };
}

function matchesFilter(row: Record<string, unknown>, filter: FilterItem): boolean {
  const actual = row[filter.field];
  if (actual == null) {
    return false;
  }

  const source = String(actual).toLocaleLowerCase();
  const expected = filter.value.toLocaleLowerCase();

  switch (filter.operator) {
    case 'equals': return source === expected;
    case 'startsWith': return source.startsWith(expected);
    case 'endsWith': return source.endsWith(expected);
    case 'contains': return source.includes(expected);
  }
}

function compareRows(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  sort: ListSort[]
): number {
  for (const item of sort) {
    const result = compareValues(a[item.field], b[item.field]);

    if (result !== 0) {
      return item.direction === 'asc' ? result : -result;
    }
  }

  return 0;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}
