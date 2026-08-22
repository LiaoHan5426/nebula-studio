export type PackagedRemoteUpdateSource = 'packaged-protocol' | 'runtime-http';

export interface PackagedRemoteUpdatePolicy {
  allowHttpAutoUpdate: boolean;
  pinToExtraResources: boolean;
  source: PackagedRemoteUpdateSource;
}

export function currentLocationProtocol(): string {
  if (typeof location === 'undefined') {
    return 'http:';
  }
  return location.protocol;
}

/**
 * Packaged Electron Hosts serve remotes from extraResources via nebula-remote://.
 * Those installs do not auto-upgrade from HTTP/CDN; a new installer ships the next dist.
 */
export function packagedRemoteUpdatePolicy(
  protocol = currentLocationProtocol(),
): PackagedRemoteUpdatePolicy {
  const packaged = protocol === 'file:' || protocol === 'nebula-remote:';
  if (packaged) {
    return {
      allowHttpAutoUpdate: false,
      pinToExtraResources: true,
      source: 'packaged-protocol',
    };
  }
  return {
    allowHttpAutoUpdate: true,
    pinToExtraResources: false,
    source: 'runtime-http',
  };
}
