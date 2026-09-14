import { EntityLocateRequest, EntityLocateResult, ListQuery } from '../../app/entity/entity-types';
import { applyListQuery } from './apply-list-query';

export function locateMockEntity(
  rows: Record<string, unknown>[],
  idField: string,
  request: EntityLocateRequest,
): EntityLocateResult {
  const allRows = applyListQuery(rows, {
    page: 1,
    pageSize: rows.length || 1,
    sort: request.sort,
    filter: request.filter,
  } satisfies ListQuery).items;
  const index = allRows.findIndex((row) => String(row[idField]) === String(request.id));
  if (index < 0) return { found: false, page: null, result: null };

  const page = Math.floor(index / request.pageSize) + 1;
  return {
    found: true,
    page,
    result: applyListQuery(rows, {
      page,
      pageSize: request.pageSize,
      sort: request.sort,
      filter: request.filter,
    }),
  };
}
