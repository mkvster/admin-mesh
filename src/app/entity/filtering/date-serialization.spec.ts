import { describe, expect, it } from 'vitest';
import { parseDateValue, serializeDateValue } from './date-serialization';

describe('date serialization', () => {
  it('parses date-only values in local time', () => {
    const parsed = parseDateValue('2026-08-01', 'date');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(7);
    expect(parsed?.getDate()).toBe(1);
  });

  it('parses datetime values with the native date parser', () => {
    expect(parseDateValue('2026-08-01T12:34:56.000Z', 'datetime')?.toISOString()).toBe(
      '2026-08-01T12:34:56.000Z',
    );
  });

  it('returns null for unsupported or invalid values', () => {
    expect(parseDateValue(undefined, 'date')).toBeNull();
    expect(parseDateValue('not-a-date', 'datetime')).toBeNull();
  });

  it('serializes date values without changing the local calendar date', () => {
    const date = new Date(2026, 7, 1, 12, 34, 56);

    expect(serializeDateValue(date, 'date')).toBe('2026-08-01');
    expect(serializeDateValue(date, 'datetime')).toBe(date.toISOString());
  });
});
