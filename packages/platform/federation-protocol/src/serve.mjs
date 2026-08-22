import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, isAbsolute, relative, resolve } from 'node:path';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'cross-origin-resource-policy': 'cross-origin',
};

export const NEBULA_REMOTE_SCHEME = 'nebula-remote';
export const MF_POC_SCHEME = 'mf-poc';

function isInsideRoot(root, candidate) {
  const rel = relative(resolve(root), resolve(candidate));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

export function resolveFederationDistFile(roots, hostname, pathname) {
  const root = roots[hostname];
  if (!root) {
    throw new Error(`unknown federation host: ${hostname}`);
  }
  const decoded = decodeURIComponent(pathname ?? '');
  if (decoded.includes('\0')) {
    throw new Error('invalid path');
  }
  const rel = decoded.replace(/^\/+/, '') || 'index.html';
  const filePath = resolve(root, rel);
  if (!isInsideRoot(root, filePath)) {
    throw new Error('path escape');
  }
  return filePath;
}

export function contentTypeFor(filePath) {
  switch (extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
    case '.map':
      return 'application/json; charset=utf-8';
    case '.wasm':
      return 'application/wasm';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

export function rewriteFederationPublicPath(jsonText, originBase) {
  const data = JSON.parse(jsonText);
  if (data.metaData && typeof data.metaData === 'object') {
    data.metaData.publicPath = originBase;
  }
  return JSON.stringify(data);
}

export function createFederationDistResponse(options) {
  const { roots, hostname, pathname, scheme } = options;
  const filePath = resolveFederationDistFile(roots, hostname, pathname);
  if (!existsSync(filePath)) {
    return {
      status: 404,
      body: `missing ${filePath}`,
      headers: {
        ...corsHeaders,
        'content-type': 'text/plain; charset=utf-8',
      },
    };
  }

  let body = readFileSync(filePath);
  const name = basename(filePath);
  if (name === 'mf-manifest.json' || name === 'mf-stats.json') {
    body = Buffer.from(
      rewriteFederationPublicPath(
        body.toString('utf8'),
        `${scheme}://${hostname}/`,
      ),
    );
  }

  return {
    status: 200,
    body,
    headers: {
      ...corsHeaders,
      'content-type': contentTypeFor(filePath),
    },
  };
}

export function federationProtocolPrivileges() {
  return {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: true,
    stream: true,
  };
}

/**
 * Packaged Electron uses extraResources; Playwright / electron-vite preview
 * launch `out/main` with `is.dev === false` but no extraResources tree.
 */
export function pickFederationRemoteRoots(options) {
  const { isDev, packaged, repo, hasManifest } = options;
  const packagedHas = Object.values(packaged).some((dir) => hasManifest(dir));
  const repoHas = Boolean(
    repo && Object.values(repo).some((dir) => hasManifest(dir)),
  );
  if (isDev) {
    return repo ?? packaged;
  }
  if (packagedHas) {
    return packaged;
  }
  if (repoHas) {
    return repo;
  }
  return packaged;
}
