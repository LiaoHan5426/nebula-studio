/** Keep in sync with `HOST_MF_GATEWAY_PREFIX` in nebulaHostDevRemotesPlugin.ts */
export const HOST_MF_GATEWAY_PREFIX = '/__nebula-mf';
/** @deprecated Use HOST_MF_GATEWAY_PREFIX */
export const HOST_DEV_MF_GATEWAY_PREFIX = HOST_MF_GATEWAY_PREFIX;

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost']);

export function isLoopbackHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      LOOPBACK_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export function shouldRewriteLoopbackManifestToHostGateway(
  httpEntry: string,
  pageOrigin: string,
): boolean {
  return isLoopbackHttpOrigin(httpEntry) && isLoopbackHttpOrigin(pageOrigin);
}

export function hostDevMfEntryUrl(
  packagedHost: string,
  httpEntry: string,
  pageOrigin: string,
): string {
  const entry = new URL(httpEntry);
  const rest = `${entry.pathname}${entry.search}${entry.hash}`;
  const nestedPrefix = `${HOST_MF_GATEWAY_PREFIX}/${packagedHost}`;
  if (rest === nestedPrefix || rest.startsWith(`${nestedPrefix}/`)) {
    return new URL(rest, `${pageOrigin.replace(/\/$/, '')}/`).href;
  }
  const path = `${nestedPrefix}${rest.startsWith('/') ? rest : `/${rest}`}`;
  return new URL(path, `${pageOrigin.replace(/\/$/, '')}/`).href;
}

export function hostDevMfManifestUrl(
  packagedHost: string,
  pageOrigin: string,
): string {
  const path = `${HOST_MF_GATEWAY_PREFIX}/${packagedHost}/mf-manifest.json`;
  return new URL(path, `${pageOrigin.replace(/\/$/, '')}/`).href;
}

/** First-party remotes always live on the Host; only preserve non-manifest test paths. */
export function hostOwnedMfEntryUrl(
  packagedHost: string,
  httpEntry: string,
  pageOrigin: string,
): string {
  try {
    const file = new URL(httpEntry).pathname.split('/').pop() ?? '';
    if (
      file === 'mf-manifest.json' ||
      file === 'mf-stats.json' ||
      file === ''
    ) {
      return hostDevMfManifestUrl(packagedHost, pageOrigin);
    }
  } catch {
    return hostDevMfManifestUrl(packagedHost, pageOrigin);
  }
  return hostDevMfEntryUrl(packagedHost, httpEntry, pageOrigin);
}

export function isHostOwnedManifestEntry(entry: string): boolean {
  try {
    const url = new URL(entry, 'http://127.0.0.1');
    if (url.protocol === 'nebula-remote:' || url.protocol === 'mf-poc:') {
      return true;
    }
    return url.pathname.startsWith(`${HOST_MF_GATEWAY_PREFIX}/`);
  } catch {
    return entry.includes(HOST_MF_GATEWAY_PREFIX);
  }
}
