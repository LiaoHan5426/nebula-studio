export function joinOrigin(origin: string, path = '/'): string {
  const base = String(origin).replace(/\/$/, '');
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
