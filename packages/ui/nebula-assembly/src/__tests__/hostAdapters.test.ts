import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createElectronHostAdapter,
  createStandaloneHostAdapter,
  createWebHostAdapter,
} from '../host/createHostAdapters';

const adapterSource = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../host/createHostAdapters.ts',
  ),
  'utf8',
);

describe('host adapters', () => {
  it('adapter implementation does not read electron globals', () => {
    expect(adapterSource).not.toMatch(/\bwindow\.electron\b/);
    expect(adapterSource).not.toMatch(/\bwindow\.api\b/);
  });

  it('normalizes capabilities from explicit boot input', async () => {
    const calls: string[] = [];
    const adapter = createElectronHostAdapter({
      surface: 'electron',
      notify: (message) => calls.push(message),
      openExternal: async (url) => {
        calls.push(`open:${url}`);
      },
      navigate: (path) => calls.push(`nav:${path}`),
      resolveAsset: (path) => `/assets/${path}`,
    });

    expect(adapter.surface).toBe('electron');
    await adapter.openExternal('https://example.com');
    adapter.notify('hello');
    adapter.navigate('/settings');
    expect(adapter.resolveAsset('logo.svg')).toBe('/assets/logo.svg');
    expect(calls).toEqual([
      'open:https://example.com',
      'hello',
      'nav:/settings',
    ]);
  });

  it('web and standalone adapters preserve surface defaults', () => {
    const web = createWebHostAdapter({ surface: 'platform-embed' });
    const standalone = createStandaloneHostAdapter({ surface: 'standalone' });
    expect(web.surface).toBe('platform-embed');
    expect(standalone.surface).toBe('standalone');
  });
});
