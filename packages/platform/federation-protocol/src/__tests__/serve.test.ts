import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createFederationDistResponse,
  pickFederationRemoteRoots,
  resolveFederationDistFile,
  rewriteFederationPublicPath,
} from '../serve.mjs';

describe('federation-protocol', () => {
  it('rewrites manifest publicPath to the custom scheme origin', () => {
    const next = rewriteFederationPublicPath(
      JSON.stringify({ metaData: { publicPath: '/' } }),
      'nebula-remote://docs/',
    );
    expect(JSON.parse(next).metaData.publicPath).toBe('nebula-remote://docs/');
  });

  it('rejects path escape', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nebula-fed-'));
    expect(() =>
      resolveFederationDistFile({ docs: dir }, 'docs', '/../package.json'),
    ).toThrow(/path escape/);
  });

  it('serves javascript MIME for remoteEntry.js', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nebula-fed-'));
    writeFileSync(join(dir, 'remoteEntry.js'), 'export default {}');
    const response = createFederationDistResponse({
      roots: { docs: dir },
      hostname: 'docs',
      pathname: '/remoteEntry.js',
      scheme: 'nebula-remote',
    });
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('javascript');
  });

  it('falls back to repo dist when unpackaged production has no extraResources', () => {
    const packaged = { docs: '/resources/remotes/docs' };
    const repo = { docs: '/repo/apps/sub-web/docs/dist' };
    const roots = pickFederationRemoteRoots({
      isDev: false,
      packaged,
      repo,
      hasManifest: (dir) => dir === repo.docs,
    });
    expect(roots).toEqual(repo);
  });

  it('prefers extraResources when packaged manifests exist', () => {
    const packaged = { docs: '/resources/remotes/docs' };
    const repo = { docs: '/repo/apps/sub-web/docs/dist' };
    const roots = pickFederationRemoteRoots({
      isDev: false,
      packaged,
      repo,
      hasManifest: (dir) => dir === packaged.docs,
    });
    expect(roots).toEqual(packaged);
  });
});
