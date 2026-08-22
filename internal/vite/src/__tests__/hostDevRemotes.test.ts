import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { findMonorepoRoot } from '../config/windowsManifest.ts';
import {
  collectFederationDevRemotes,
  HOST_DEV_MF_GATEWAY_PREFIX,
  isLikelyMfManifestJson,
  parseHostDevMfRequestUrl,
  resolveViteCli,
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
});
