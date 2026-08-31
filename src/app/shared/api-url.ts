export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

export function normalizeUrlPath(path: string): string {
  return path.replace(/^\//, '');
}
