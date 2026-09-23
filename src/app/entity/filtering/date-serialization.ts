export type DateValueType = 'date' | 'datetime';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateValue(value: unknown, type: DateValueType): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  if (type === 'date' && typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function serializeDateValue(date: Date, type: DateValueType): string {
  if (type === 'datetime') {
    return date.toISOString();
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
