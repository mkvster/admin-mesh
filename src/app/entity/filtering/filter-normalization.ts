/**
 * Removes exact duplicate conditions while preserving the first occurrence.
 * The value is intentionally serialized as data so this also supports future
 * scalar and range filter values without type-specific deduplication logic.
 */
export function normalizeFilterItems<T extends { field: string; operator: string; value: unknown }>(
  items: T[]
): T[] {
  const seen = new Set<string>();

  return items.filter(item => {
    const key = `${item.field}\u0000${item.operator}\u0000${JSON.stringify(item.value)}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
