import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  createFederationDistResponse,
  federationProtocolPrivileges,
  findMonorepoRoot,
  NEBULA_REMOTE_SCHEME,
  pickFederationRemoteRoots,
} from '@nebula-studio/federation-protocol';

import { protocol } from 'electron';

import { is } from '../runtime/electronMainUtils';

protocol.registerSchemesAsPrivileged([
  {
    scheme: NEBULA_REMOTE_SCHEME,
    privileges: federationProtocolPrivileges(),
  },
]);

export function nebulaRemoteOrigin(host: string): string {
  return `${NEBULA_REMOTE_SCHEME}://${host}`;
}

function packagedRemoteRoots(): Record<string, string> {
  return {
    docs: join(process.resourcesPath, 'remotes/docs'),
    settings: join(process.resourcesPath, 'remotes/settings'),
    integration: join(process.resourcesPath, 'remotes/integration'),
    'low-code-studio': join(process.resourcesPath, 'remotes/low-code-studio'),
  };
}

function repoRemoteRoots(): null | Record<string, string> {
  const root = findMonorepoRoot(process.cwd());
  if (!root) {
    return null;
  }
  return {
    docs: join(root, 'apps/sub-web/docs/dist'),
    settings: join(root, 'apps/sub-web/settings/dist'),
    integration: join(root, 'apps/sub-web/integration/dist'),
    'low-code-studio': join(root, 'apps/remotes/low-code-studio/dist'),
  };
}

export function resolveNebulaRemoteDistRoots(): Record<string, string> {
  return pickFederationRemoteRoots({
    isDev: is.dev,
    packaged: packagedRemoteRoots(),
    repo: repoRemoteRoots(),
    hasManifest: (dir) => existsSync(join(dir, 'mf-manifest.json')),
  });
}

export function attachNebulaRemoteProtocolHandler(
  roots: Record<string, string> = resolveNebulaRemoteDistRoots(),
): void {
  protocol.handle(NEBULA_REMOTE_SCHEME, (request) => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
        },
      });
    }
    try {
      const url = new URL(request.url);
      const result = createFederationDistResponse({
        roots,
        hostname: url.hostname,
        pathname: url.pathname,
        scheme: NEBULA_REMOTE_SCHEME,
      });
      return new Response(
        typeof result.body === 'string'
          ? result.body
          : Uint8Array.from(result.body),
        {
          status: result.status,
          headers: result.headers,
        },
      );
    } catch (error) {
      return new Response(String(error), {
        status: 404,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'access-control-allow-origin': '*',
        },
      });
    }
  });
}
