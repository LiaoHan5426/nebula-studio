import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { findMonorepoRoot } from '@nebula-studio-internal/node-kit/windows-manifest';
import {
  collectFederationDevRemotes,
  HOST_DEV_MF_GATEWAY_PREFIX,
  hostOwnedRemotePublicPath,
  isLikelyMfManifestJson,
  isLoopbackOriginOnPort,
  isWebHostRoot,
  parseHostDevMfRequestUrl,
  resolveViteCli,
  rewriteHostMfPublicPath,
  rewriteProxiedRemoteBody,
  rewriteViteDevAssetUrls,
} from '../federation/nebulaHostDevRemotesPlugin.ts';

describe('host dev remotes gateway', () => {
  it('parses Host-relative MF paths', () => {
    expect(
      parseHostDevMfRequestUrl(
        `${HOST_DEV_MF_GATEWAY_PREFIX}/integration/mf-manifest.json?x=1`,
      ),
    ).toEqual({
      appId: 'integration',
      rest: '/mf-manifest.json',
    });
    expect(parseHostDevMfRequestUrl('/other')).toBeNull();
    expect(
      parseHostDevMfRequestUrl(`${HOST_DEV_MF_GATEWAY_PREFIX}/../docs/x`),
    ).toBeNull();
  });

  it('rejects HTML that Vite would serve for a missing manifest', () => {
    expect(isLikelyMfManifestJson('<!doctype html>')).toBe(false);
    expect(
      isLikelyMfManifestJson(
        '{"id":"nebula_integration","exposes":[{"name":"./application"}]}',
      ),
    ).toBe(true);
  });

  it('collects federation remotes from windows.json without hardcoding ports', () => {
    const root = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));
    const remotes = collectFederationDevRemotes(root);
    expect(remotes.map((remote) => remote.appId).toSorted()).toEqual([
      'docs',
      'integration',
      'low-code-studio',
      'settings',
    ]);
    for (const remote of remotes) {
      expect(remote.configuredOrigin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
      expect(remote.packageName).toBe(
        `@nebula-studio-renderer/${remote.appId}`,
      );
    }
  });

  it('resolves the Vite CLI as a Node entry instead of vp.cmd', () => {
    const root = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));
    const remotes = collectFederationDevRemotes(root);
    const docs = remotes.find((remote) => remote.appId === 'docs');
    expect(docs).toBeDefined();
    expect(resolveViteCli(docs?.appDir ?? '')).toMatch(
      /vite[\\/]bin[\\/]vite\.js$/,
    );
  });

  it('rewrites first-party remote publicPath onto the Host gateway', () => {
    expect(hostOwnedRemotePublicPath('docs')).toBe('/__nebula-mf/docs/');
    expect(hostOwnedRemotePublicPath('docs', '/studio/')).toBe(
      '/studio/__nebula-mf/docs/',
    );
    expect(isWebHostRoot('F:/repo/apps/web')).toBe(true);
    expect(isWebHostRoot('F:/repo/apps/electron')).toBe(false);
    expect(isLoopbackOriginOnPort('http://127.0.0.1:5174', 5174)).toBe(true);
    expect(isLoopbackOriginOnPort('http://127.0.0.1:5176', 5174)).toBe(false);
    expect(
      JSON.parse(
        rewriteHostMfPublicPath(
          '{"metaData":{"publicPath":"http://localhost:5176/"}}',
          '/__nebula-mf/docs/',
        ),
      ).metaData.publicPath,
    ).toBe('/__nebula-mf/docs/');
  });

  it('pins proxied manifests to the Host gateway instead of the child port', () => {
    expect(
      JSON.parse(
        rewriteProxiedRemoteBody({
          appId: 'low-code-studio',
          contentType: 'application/json',
          isManifest: true,
          rest: '/mf-manifest.json',
          text: '{"metaData":{"publicPath":"http://localhost:5194/"}}',
        }),
      ).metaData.publicPath,
    ).toBe('/__nebula-mf/low-code-studio/');
  });

  it('rewrites Vite dev absolute imports onto the Host gateway', () => {
    expect(
      rewriteViteDevAssetUrls(
        'import x from "/node_modules/.vite/deps/vue.js?v=1";',
        '/__nebula-mf/docs',
      ),
    ).toBe(
      'import x from "/__nebula-mf/docs/node_modules/.vite/deps/vue.js?v=1";',
    );
    expect(
      rewriteViteDevAssetUrls(
        'import x from "/__nebula-mf/docs/node_modules/vue.js";',
        '/__nebula-mf/docs',
      ),
    ).toBe('import x from "/__nebula-mf/docs/node_modules/vue.js";');
  });
});
