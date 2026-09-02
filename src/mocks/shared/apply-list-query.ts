import { ListQuery, ListQueryResult, ListSort } from '../../app/entity/entity-types';

export function applyListQuery(
  rows: Record<string, unknown>[],
  query: ListQuery
): ListQueryResult {
  let result = [...rows];

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
