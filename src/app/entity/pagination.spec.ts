import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalizePageNumber,
  normalizePageSize,
} from './pagination';

describe('normalizePageSize', () => {
  it('keeps values within the allowed range', () => {
    expect(normalizePageSize(1)).toBe(1);
    expect(normalizePageSize(500)).toBe(MAX_PAGE_SIZE);
  });

  it('caps oversized values and falls back for invalid values', () => {
    expect(normalizePageSize(79879879887987)).toBe(MAX_PAGE_SIZE);
    expect(normalizePageSize(0)).toBe(DEFAULT_PAGE_SIZE);
    expect(normalizePageSize(Number.MAX_SAFE_INTEGER + 1)).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('normalizePageNumber', () => {
  it('uses the first page for invalid or unsafe page numbers', () => {
    expect(normalizePageNumber(1)).toBe(1);
    expect(normalizePageNumber(1.3495095095802959e31)).toBe(1);
    expect(normalizePageNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(1);
    expect(normalizePageNumber(0)).toBe(1);
  });
});
