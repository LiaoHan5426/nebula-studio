import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  resolveFederationDevEntryOrigin,
  resolveFederationDevHost,
} from '@nebula-studio-internal/node-kit/runtime-config';
import {
  findMonorepoRoot,
  loadWindowsConfig,
} from '@nebula-studio-internal/node-kit/windows-manifest';
import {
  collectFederationDevRemotes,
  HOST_DEV_MF_GATEWAY_PREFIX,
  hostOwnedRemotePublicPath,
  isLikelyMfManifestJson,
  isOriginOnConfiguredHostPort,
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
    const windows = loadWindowsConfig(root);
    const remotes = collectFederationDevRemotes(root);
    expect(remotes.map((remote) => remote.appId).toSorted()).toEqual([
      'docs',
      'integration',
      'low-code-studio',
      'settings',
    ]);
    for (const remote of remotes) {
      if (remote.appId === 'low-code-studio') {
        expect(remote.configuredOrigin).toBe(
          resolveFederationDevEntryOrigin(
            windows.federationDevEntries?.['low-code-studio']?.defaultHttpEntry ??
              '',
          ),
        );
      } else {
        expect(remote.configuredOrigin).toBe(
          new URL(
            windows.windows[remote.appId]?.standalone?.basePath ?? '/',
            `http://${windows.shell?.web?.host}:${String(
              windows.windows[remote.appId]?.standalone?.port,
            )}`,
          ).toString().replace(/\/$/, ''),
        );
      }
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
    const root = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));
    const remotes = collectFederationDevRemotes(root);
    const docs = remotes.find((remote) => remote.appId === 'docs');
    expect(docs).toBeDefined();
    expect(hostOwnedRemotePublicPath('docs')).toBe('/__nebula-mf/docs/');
    expect(hostOwnedRemotePublicPath('docs', '/studio/')).toBe(
      '/studio/__nebula-mf/docs/',
    );
    expect(isWebHostRoot('F:/repo/apps/web')).toBe(true);
    expect(isWebHostRoot('F:/repo/apps/electron')).toBe(false);
    const devHost = resolveFederationDevHost(
      loadWindowsConfig(findMonorepoRoot(dirname(fileURLToPath(import.meta.url)))),
    );
    expect(
      isOriginOnConfiguredHostPort(`http://${devHost}:5174`, [devHost], 5174),
    ).toBe(true);
    expect(
      isOriginOnConfiguredHostPort(`http://${devHost}:5176`, [devHost], 5174),
    ).toBe(false);
    expect(
      JSON.parse(
        rewriteHostMfPublicPath(
          JSON.stringify({
            metaData: { publicPath: `${docs?.configuredOrigin}/` },
          }),
          '/__nebula-mf/docs/',
        ),
      ).metaData.publicPath,
    ).toBe('/__nebula-mf/docs/');
  });

  it('pins proxied manifests to the Host gateway instead of the child port', () => {
    const root = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));
    const remotes = collectFederationDevRemotes(root);
    const lowCode = remotes.find((remote) => remote.appId === 'low-code-studio');
    expect(lowCode).toBeDefined();
    expect(
      JSON.parse(
        rewriteProxiedRemoteBody({
          appId: 'low-code-studio',
          contentType: 'application/json',
          isManifest: true,
          rest: '/mf-manifest.json',
          text: JSON.stringify({
            metaData: { publicPath: `${lowCode?.configuredOrigin}/` },
          }),
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
