import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
    expect(manifest.preloadIds).toContain('main');
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
});
