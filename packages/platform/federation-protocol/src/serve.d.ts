export const NEBULA_REMOTE_SCHEME: 'nebula-remote';
export const MF_POC_SCHEME: 'mf-poc';

export function resolveFederationDistFile(
  roots: Record<string, string>,
  hostname: string,
  pathname: string,
): string;

export function contentTypeFor(filePath: string): string;

export function rewriteFederationPublicPath(
  jsonText: string,
  originBase: string,
): string;

export function createFederationDistResponse(options: {
  hostname: string;
  pathname: string;
  roots: Record<string, string>;
  scheme: string;
}): {
  body: Buffer | string;
  headers: Record<string, string>;
  status: number;
};

export function federationProtocolPrivileges(): {
  corsEnabled: boolean;
  secure: boolean;
  standard: boolean;
  stream: boolean;
  supportFetchAPI: boolean;
};

export function pickFederationRemoteRoots(options: {
  hasManifest: (dir: string) => boolean;
  isDev: boolean;
  packaged: Record<string, string>;
  repo: null | Record<string, string>;
}): Record<string, string>;
