export type CatalogSourceId =
  | 'api'
  | 'connector'
  | 'orgResources'
  | 'pluginCatalog';

export function mapIntegrationErrorCode(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? '');
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  if (code && code !== 'undefined') return code;
  if (/409|duplicate/i.test(message)) return 'duplicate';
  if (/403/.test(message)) return 'forbidden';
  if (/401/.test(message)) return 'unauthorized';
  return 'generic';
}

export function errorMessageKey(code: string): string {
  return `errors.${code}`;
}
