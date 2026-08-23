export function joinOrigin(origin, path = '/') {
  const base = String(origin).replace(/\/$/, '');
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
