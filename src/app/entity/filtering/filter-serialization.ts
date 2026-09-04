import { FilterItem, FilterOperator, FilterValue, ListFilter } from '../entity-types';
import { MAX_FILTER_ITEMS, MAX_SERIALIZED_FILTER_LENGTH } from './filter-constraints';
import { normalizeFilterItems } from './filter-normalization';

export interface ListFilterScope {
  resource: string;
  listId: string;
}

export function serializeListFilter(items: FilterItem[], scope?: ListFilterScope): string {
  const normalizedItems = normalizeFilterItems(items);
  const json = JSON.stringify(scope
    ? { ...scope, filter: { operator: 'and', items: normalizedItems } }
    : { operator: 'and', items: normalizedItems });
  const bytes = new TextEncoder().encode(json);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function parseListFilter(value: string | null, scope?: ListFilterScope): ListFilter | undefined {
  if (!value || value.length > MAX_SERIALIZED_FILTER_LENGTH) {
    return undefined;
  }

  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<ListFilter> &
      Partial<ListFilterScope> & { filter?: Partial<ListFilter> };

    if (scope && (parsed.resource !== scope.resource || parsed.listId !== scope.listId)) {
      return undefined;
    }

    const filter = parsed.filter ?? parsed;
    if (filter.operator !== 'and' || !Array.isArray(filter.items)) {
      return undefined;
    }

    const items = filter.items.filter(isFilterItem);
    return items.length === filter.items.length && items.length <= MAX_FILTER_ITEMS
      ? { operator: 'and', items: normalizeFilterItems(items) }
      : undefined;
  } catch {
    return undefined;
  }
}

function isFilterItem(item: unknown): item is FilterItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Partial<FilterItem>;
  return typeof candidate.field === 'string'
    && isFilterValue(candidate.value)
    && isFilterOperator(candidate.operator);
}

function isFilterValue(value: unknown): value is FilterValue {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'boolean') {
    return true;
  }

  return Array.isArray(value)
    && value.length === 2
    && value.every(item =>
      (typeof item === 'string' && item.trim().length > 0)
      || (typeof item === 'number' && Number.isFinite(item))
    );
}

function isFilterOperator(operator: unknown): operator is FilterOperator {
  return operator === 'contains'
    || operator === 'equals'
    || operator === 'startsWith'
    || operator === 'endsWith'
    || operator === 'notEquals'
    || operator === 'greaterThan'
    || operator === 'greaterThanOrEqual'
    || operator === 'lessThan'
    || operator === 'lessThanOrEqual'
    || operator === 'between'
    || operator === 'before'
    || operator === 'after'
    || operator === 'inThePast';
}
