/** Keep in sync with `HOST_DEV_MF_GATEWAY_PREFIX` in nebulaHostDevRemotesPlugin.ts */
export const HOST_DEV_MF_GATEWAY_PREFIX = '/__nebula-mf';

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
  const nestedPrefix = `${HOST_DEV_MF_GATEWAY_PREFIX}/${packagedHost}`;
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
  const path = `${HOST_DEV_MF_GATEWAY_PREFIX}/${packagedHost}/mf-manifest.json`;
  return new URL(path, `${pageOrigin.replace(/\/$/, '')}/`).href;
}
