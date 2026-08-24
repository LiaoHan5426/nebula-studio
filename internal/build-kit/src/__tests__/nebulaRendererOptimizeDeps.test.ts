import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  resolveFederationDevRemoteCacheDir,
  resolveFederationDevRemoteOrigin,
} from '@nebula-studio-internal/node-kit/runtime-config';
import {
  createNebulaOptimizeDeps,
  resolveNebulaHostedRemoteCacheDir,
  resolveNebulaHostedRemoteEnv,
  resolveNebulaOptimizeDepsInclude,
} from '../config/nebulaRendererOptimizeDeps.ts';

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = join(kitRoot, '../..');

describe('createNebulaOptimizeDeps', () => {
  it('includes packages that resolve from the app root', () => {
    const include = resolveNebulaOptimizeDepsInclude(kitRoot);
    expect(include).toContain('vue');
    expect(include).not.toContain('markdown-it');
    expect(include).not.toContain('shiki');
  });

  it('includes dependencies declared by direct workspace UI packages used by an app', () => {
    const include = resolveNebulaOptimizeDepsInclude(
      join(repoRoot, 'apps/sub-web/docs'),
    );
    expect(include).toContain('vuedraggable');
    expect(include).toContain('markdown-it');
    expect(include).toContain('shiki');
  });

  it('does not include workspace UI dependencies for remotes that do not use them', () => {
    const include = resolveNebulaOptimizeDepsInclude(
      join(repoRoot, 'apps/remotes/low-code-studio'),
    );
    expect(include).toContain('vue');
    expect(include).not.toContain('vuedraggable');
    expect(include).not.toContain('markdown-it');
    expect(include).not.toContain('shiki');
  });

  it('does not wait for crawl-end, so MF virtual modules cannot invalidate metadata', () => {
    const deps = createNebulaOptimizeDeps({ root: kitRoot });
    expect(deps.holdUntilCrawlEnd).toBe(false);
    expect(deps.noDiscovery).toBeUndefined();
  });

  it('freezes discovery on host-composed remotes', () => {
    const deps = createNebulaOptimizeDeps({
      root: kitRoot,
      hostedRemote: true,
    });
    expect(deps.noDiscovery).toBe(true);
    expect(deps.holdUntilCrawlEnd).toBe(false);
  });

  it('only treats a positive integer NEBULA_REMOTE_PORT as hosted remote mode', () => {
    expect(resolveNebulaHostedRemoteEnv({ NEBULA_REMOTE_PORT: '' })).toBeUndefined();
    expect(resolveNebulaHostedRemoteEnv({ NEBULA_REMOTE_PORT: 'abc' })).toBeUndefined();
    expect(resolveNebulaHostedRemoteEnv({ NEBULA_REMOTE_PORT: '-1' })).toBeUndefined();
    expect(resolveNebulaHostedRemoteEnv({ NEBULA_REMOTE_PORT: '0' })).toBeUndefined();
    expect(resolveNebulaHostedRemoteEnv({ NEBULA_REMOTE_PORT: '5179' })).toEqual({
      cacheDir: resolveFederationDevRemoteCacheDir(5179),
      origin: resolveFederationDevRemoteOrigin(5179),
      port: 5179,
    });
  });

  it('derives hosted remote cacheDir from the parsed port', () => {
    expect(resolveNebulaHostedRemoteCacheDir(5180)).toBe(
      resolveFederationDevRemoteCacheDir(5180),
    );
    const origin = resolveFederationDevRemoteOrigin(5181);
    expect(
      resolveNebulaHostedRemoteEnv({
        NEBULA_REMOTE_ORIGIN: origin,
        NEBULA_REMOTE_PORT: '5181',
      }),
    ).toEqual({
      cacheDir: resolveFederationDevRemoteCacheDir(5181),
      origin,
      port: 5181,
    });
  });
});
