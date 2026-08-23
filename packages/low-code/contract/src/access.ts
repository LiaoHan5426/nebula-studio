export const LOW_CODE_ANONYMOUS_API_PREFIX = '/api/low-code/runtime/';

export const LOW_CODE_AUTHENTICATED_API_PREFIXES = [
  '/api/low-code/studio',
  '/api/low-code/catalog',
  '/api/low-code/write',
] as const;

/** Security review default: third-party catalog stays closed until explicitly opened. */
export const LOW_CODE_THIRD_PARTY_CATALOG_ENABLED = false;

export function lowCodePathRequiresAuth(path: string): boolean {
  if (path.startsWith(LOW_CODE_ANONYMOUS_API_PREFIX)) {
    return false;
  }
  return LOW_CODE_AUTHENTICATED_API_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
