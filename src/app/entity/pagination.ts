export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 500;

export function normalizePageSize(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(value, MAX_PAGE_SIZE);
}

export function normalizePageNumber(value: number): number {
  return Number.isSafeInteger(value) && value > 0 ? value : 1;
}
