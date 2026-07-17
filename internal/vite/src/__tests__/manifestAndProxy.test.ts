import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import {
  buildAppManifest,
  loadWindowsConfig,
  findMonorepoRoot,
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
    expect(manifest.embedBootEntries).toEqual({
      docs: './embed/docs-entry.js',
      integration: './embed/integration-entry.js',
      login: './embed/login-entry.js',
      settings: './embed/settings-entry.js',
    });
    expect(manifest.preloadIds).toContain('main');
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
              label: 'Custom',
              webEmbedEntry: './embed/custom-entry.js',
            },
          },
        },
        root,
      );

      expect(manifest.embedBootEntries).toEqual({
        custom: './embed/custom-entry.js',
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('createNebulaApiProxy', () => {
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
    expect(proxy['/api/executor']?.target).toBe('http://executor.test');
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
