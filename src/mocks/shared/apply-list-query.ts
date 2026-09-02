import { ListQuery, ListQueryResult } from '../../app/entity/entity-types';

export function applyListQuery(
  rows: Record<string, unknown>[],
  query: ListQuery
): ListQueryResult {
  const start = (query.page - 1) * query.pageSize;

  return {
    items: rows.slice(start, start + query.pageSize),
    totalCount: rows.length
  };
}
