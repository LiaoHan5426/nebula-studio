import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadApiContext } from '../config/apiContext.ts';
import {
  buildAppManifest,
  findMonorepoRoot,
  loadWindowsConfig,
} from '../config/windowsManifest.ts';
import { createNebulaApiProxy } from '../proxy/createNebulaApiProxy.ts';

describe('windows manifest', () => {
  it('loads windows.json and builds manifest', () => {
    const root = findMonorepoRoot(
      join(dirname(fileURLToPath(import.meta.url)), '../../..'),
    );
    const config = loadWindowsConfig(root);
    const manifest = buildAppManifest(config, root);
    expect(manifest.subApps).toContain('integration');
    expect(manifest.embedSurfaces).toContain('docs');
    expect(manifest.federationSurfaces).toEqual([
      'docs',
      'integration',
      'settings',
    ]);
    expect(manifest.embedSurfaces).toContain('login');
    expect(manifest.embedBootEntries).toEqual({});
    expect(manifest.preloadIds).toContain('main');
    expect(manifest.preloadCapabilities).toEqual({
      docs: ['notify'],
      main: ['auth', 'notify', 'shell'],
      settings: ['settings'],
    });
  });

  it('finds the monorepo root from a relative Vite root', () => {
    expect(findMonorepoRoot('.')).toMatch(/nebula-studio$/);
  });

  it('derives embed loaders from manifest entries instead of a fixed app list', () => {
    const root = mkdtempSync(join(tmpdir(), 'nebula-manifest-'));
    try {
      mkdirSync(join(root, 'apps/sub-web/custom/src'), { recursive: true });
      mkdirSync(join(root, 'apps/web/src/embed'), { recursive: true });
      writeFileSync(join(root, 'apps/sub-web/custom/src/main.ts'), '');
      writeFileSync(join(root, 'apps/sub-web/custom/src/boot.ts'), '');
      writeFileSync(join(root, 'apps/web/src/embed/custom-entry.ts'), '');

      const manifest = buildAppManifest(
        {
          windows: {
            custom: {
              preload: 'main',
              renderer: 'custom',
              webEmbedEntry: './embed/custom-entry.js',
              preloadCapabilities: ['auth'],
            },
          },
        },
        root,
      );

      expect(manifest.embedBootEntries).toEqual({
        custom: './embed/custom-entry.js',
      });
      expect(manifest.preloadCapabilities).toEqual({ main: ['auth'] });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('createNebulaApiProxy', () => {
  it('groups API namespaces by windows.json apiTargets keys', () => {
    const root = findMonorepoRoot(
      join(dirname(fileURLToPath(import.meta.url)), '../../..'),
    );
    const config = loadWindowsConfig(root);
    const context = loadApiContext(root);
    expect(Object.keys(context.namespaces).toSorted()).toEqual(
      Object.keys(config.apiTargets ?? {}).toSorted(),
    );
    expect(context.namespaces.platform.system).toBe('/api/system');
    expect(context.namespaces.console.auth).toBe('/api/auth');
  });

  it('orders integration routes from specific to general', () => {
    const proxy = createNebulaApiProxy({
      preset: 'integration',
      targets: {
        platform: 'http://platform.test',
        console: 'http://console.test',
        executor: 'http://executor.test',
      },
    });
    const keys = Object.keys(proxy);
    expect(keys.indexOf('/api/executor')).toBeLessThan(keys.indexOf('/api'));
    expect(proxy['/api']?.target).toBe('http://console.test');
    expect(proxy['/api/system/frontend-apps']?.target).toBe(
      'http://console.test',
    );
    expect(proxy['/api/system']?.target).toBe('http://platform.test');
    expect(proxy['/api/executor']?.target).toBe('http://executor.test');
    expect(typeof proxy['/api/executor']?.configure).toBe('function');
    expect(typeof proxy['/api']?.configure).toBe('function');
  });

  it('rejects an explicitly empty proxy target', () => {
    expect(() =>
      createNebulaApiProxy({
        preset: 'integration',
        targets: {
          platform: 'http://platform.test',
          console: '',
          executor: 'http://executor.test',
        },
      }),
    ).toThrow('has no target configured');
  });
});
