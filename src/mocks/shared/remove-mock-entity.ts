export function removeMockEntity(
  rows: Record<string, unknown>[],
  idField: string,
  id: string,
): boolean {
  const index = rows.findIndex((row) => String(row[idField]) === id);

  if (index < 0) {
    return false;
  }

  rows.splice(index, 1);
  return true;
}
