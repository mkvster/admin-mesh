import {
  FilterItem,
  FilterValue,
  ListQuery,
  ListQueryResult,
  ListSort,
  RelativePastPeriod,
} from '../../app/entity/entity-types';

export function applyListQuery(rows: Record<string, unknown>[], query: ListQuery): ListQueryResult {
  let result = [...rows];

  const filters = query.filter?.items.filter((item) => hasFilterValue(item.value)) ?? [];
  if (filters.length) {
    result = result.filter((row) => filters.every((item) => matchesFilter(row, item)));
  }

  if (query.sort?.length) {
    result.sort((a, b) => compareRows(a, b, query.sort!));
  }

  const totalCount = result.length;
  const start = (query.page - 1) * query.pageSize;

  result = result.slice(start, start + query.pageSize);

  return {
    items: result,
    totalCount,
  };
}

function matchesFilter(row: Record<string, unknown>, filter: FilterItem): boolean {
  const actual = row[filter.field];

  if (
    (filter.operator === 'in' || filter.operator === 'notIn') &&
    (typeof actual === 'string' || typeof actual === 'number') &&
    Array.isArray(filter.value)
  ) {
    const included = filter.value.some((value) => value === actual);
    return filter.operator === 'in' ? included : !included;
  }

  if (
    typeof actual === 'number' &&
    (typeof filter.value === 'number' || Array.isArray(filter.value))
  ) {
    return matchesNumeric(actual, filter.operator, filter.value);
  }

  if (typeof actual === 'boolean' && typeof filter.value === 'boolean') {
    return filter.operator === 'equals' ? actual === filter.value : false;
  }

  if (typeof actual === 'string' && isDateLike(actual) && isDateFilter(filter)) {
    return matchesDate(actual, filter.operator, filter.value);
  }

  if (typeof actual !== 'string' || typeof filter.value !== 'string') {
    return false;
  }

  const source = actual.toLocaleLowerCase();
  const expected = filter.value.toLocaleLowerCase();

  switch (filter.operator) {
    case 'equals':
      return source === expected;
    case 'startsWith':
      return source.startsWith(expected);
    case 'endsWith':
      return source.endsWith(expected);
    case 'contains':
      return source.includes(expected);
    case 'notEquals':
      return source !== expected;
    default:
      return false;
  }
}

function matchesNumeric(
  actual: number,
  operator: FilterItem['operator'],
  value: FilterValue,
): boolean {
  if (typeof value === 'number') {
    switch (operator) {
      case 'equals':
        return actual === value;
      case 'notEquals':
        return actual !== value;
      case 'greaterThan':
        return actual > value;
      case 'greaterThanOrEqual':
        return actual >= value;
      case 'lessThan':
        return actual < value;
      case 'lessThanOrEqual':
        return actual <= value;
      default:
        return false;
    }
  }

  return (
    operator === 'between' &&
    Array.isArray(value) &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    actual >= value[0] &&
    actual <= value[1]
  );
}

function matchesDate(
  actual: string,
  operator: FilterItem['operator'],
  value: FilterValue,
): boolean {
  if (operator === 'inThePast' && isRelativePastPeriod(value)) {
    const actualTime = Date.parse(actual);
    return (
      Number.isFinite(actualTime) && actualTime >= Date.now() - relativePeriodMilliseconds(value)
    );
  }

  const actualTime = Date.parse(actual);
  if (!Number.isFinite(actualTime)) {
    return false;
  }

  if (typeof value === 'string') {
    const expectedTime = Date.parse(value);
    if (!Number.isFinite(expectedTime)) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return actualTime === expectedTime;
      case 'before':
        return actualTime < expectedTime;
      case 'after':
        return actualTime > expectedTime;
      default:
        return false;
    }
  }

  return (
    operator === 'between' &&
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' && Number.isFinite(Date.parse(item))) &&
    actualTime >= Date.parse(value[0] as string) &&
    actualTime <= Date.parse(value[1] as string)
  );
}

function isDateFilter(filter: FilterItem): boolean {
  return (
    filter.operator === 'before' ||
    filter.operator === 'after' ||
    filter.operator === 'between' ||
    filter.operator === 'inThePast' ||
    (filter.operator === 'equals' &&
      typeof filter.value === 'string' &&
      /^\d{4}-\d{2}-\d{2}/.test(filter.value))
  );
}

function isRelativePastPeriod(value: FilterValue): value is RelativePastPeriod {
  return (
    value === 'hour' ||
    value === '24hours' ||
    value === 'week' ||
    value === 'month' ||
    value === 'year'
  );
}

function relativePeriodMilliseconds(period: RelativePastPeriod): number {
  switch (period) {
    case 'hour':
      return 60 * 60 * 1000;
    case '24hours':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'year':
      return 365 * 24 * 60 * 60 * 1000;
  }
}

function isDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value);
}

function hasFilterValue(value: FilterValue): boolean {
  return (
    typeof value === 'boolean' ||
    (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every(
        (item) =>
          (typeof item === 'string' && item.trim().length > 0) ||
          (typeof item === 'number' && Number.isFinite(item)),
      ))
  );
}

function compareRows(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  sort: ListSort[],
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
