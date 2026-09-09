export function formatEntityId(id: string | number): string {
  return Number.isInteger(id) ? String(id) : `'${id}'`;
}

export function formatEntityTitle(singularTitle: string, id: string | number): string {
  return `${singularTitle} ${formatEntityId(id)}`;
}
