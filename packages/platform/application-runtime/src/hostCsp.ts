/**
 * Host iframe CSP. The HTML meta policy is authoritative; mutating the meta
 * tag after load does not expand the enforced CSP in browsers.
 */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

export function alignLoopbackIframeSrc(
  src: string,
  pageOrigin: string,
): string {
  try {
    const url = new URL(src);
    const page = new URL(pageOrigin);
    if (
      !LOOPBACK_HOSTS.has(url.hostname) ||
      !LOOPBACK_HOSTS.has(page.hostname)
    ) {
      return src;
    }
    url.port = page.port;
    return url.href;
  } catch {
    return src;
  }
}

export function isIframeSrcAllowed(
  src: string,
  allowedOrigins: readonly string[] | undefined,
  pageOrigin: string,
): boolean {
  let srcOrigin: string;
  try {
    srcOrigin = new URL(src).origin;
  } catch {
    return false;
  }
  if (srcOrigin === '*') {
    return false;
  }
  const allow = (allowedOrigins ?? []).filter(
    (origin) => origin && origin !== '*',
  );
  if (allow.length === 0) {
    return srcOrigin === pageOrigin;
  }
  return allow.includes(srcOrigin);
}

export function iframeFrameOrigins(
  entries: readonly {
    driver: string;
    manifestUrl?: string;
    defaultPath?: string;
  }[],
  pageOrigin: string,
  resolveSrc: (entry: { manifestUrl?: string; defaultPath?: string }) => string,
): string[] {
  const extras = new Set<string>();
  for (const entry of entries) {
    if (entry.driver !== 'iframe') continue;
    try {
      const src = alignLoopbackIframeSrc(resolveSrc(entry), pageOrigin);
      const origin = new URL(src).origin;
      if (origin !== pageOrigin) {
        extras.add(origin);
      }
    } catch {
      // skip malformed registry rows
    }
  }
  return [...extras].toSorted();
}

export function withHostFrameSrcPolicy(
  csp: string,
  extraOrigins: readonly string[] = [],
): string {
  const extras = extraOrigins
    .filter((origin) => origin && origin !== '*' && origin !== "'self'")
    .join(' ');
  const frameSrc = extras
    ? `frame-src 'self' http://localhost:* http://127.0.0.1:* ${extras}`
    : `frame-src 'self' http://localhost:* http://127.0.0.1:*`;
  if (/\bframe-src\b/.test(csp)) {
    return csp.replace(/\bframe-src\b[^;]*/u, frameSrc.trim());
  }
  return `${csp}; ${frameSrc}`.replace(/;\s*;/g, '; ');
}

export function applyHostFrameSrcPolicy(
  extraOrigins: readonly string[] = [],
): void {
  if (typeof document === 'undefined') {
    return;
  }
  const meta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]',
  );
  if (!(meta instanceof HTMLMetaElement) || !meta.content) {
    return;
  }
  meta.content = withHostFrameSrcPolicy(meta.content, extraOrigins);
}
