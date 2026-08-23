export const NEBULA_CSP_NONCE_PLACEHOLDER = 'NEBULA_CSP_NONCE';

export function withProductionScriptNonce(
  csp: string,
  nonce = NEBULA_CSP_NONCE_PLACEHOLDER,
): string {
  const token = `'nonce-${nonce}'`;
  if (!/\bscript-src\b/.test(csp)) {
    return `${csp}; script-src ${token} 'self'`;
  }
  return csp.replace(/\bscript-src\b([^;]*)/u, (_match, rest: string) => {
    const parts = rest
      .trim()
      .split(/\s+/u)
      .filter((part) => part.length > 0 && part !== "'unsafe-inline'");
    if (!parts.includes(token)) {
      parts.unshift(token);
    }
    return `script-src ${parts.join(' ')}`;
  });
}

export function applyProductionScriptNonceToHtml(
  html: string,
  nonce = NEBULA_CSP_NONCE_PLACEHOLDER,
): string {
  return html.replace(
    /(http-equiv="Content-Security-Policy"[\s\S]*?content=")([^"]*)(")/iu,
    (_match, prefix: string, csp: string, suffix: string) =>
      `${prefix}${withProductionScriptNonce(csp, nonce)}${suffix}`,
  );
}
