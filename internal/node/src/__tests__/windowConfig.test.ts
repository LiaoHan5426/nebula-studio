import { describe, expect, it } from 'vitest';

import { joinOrigin } from '../joinOrigin.mjs';
import {
  generateApiNamespacesSource,
  generateWindowsTypeScript,
  validateWindowsConfig,
} from '../windowConfig.mjs';

describe('joinOrigin', () => {
  it('joins origin and path without duplicate slashes', () => {
    expect(joinOrigin('http://localhost:8080/', '/api')).toBe(
      'http://localhost:8080/api',
    );
    expect(joinOrigin('http://localhost:8080', '/')).toBe(
      'http://localhost:8080',
    );
  });
});

describe('validateWindowsConfig', () => {
  it('reports colliding standalone ports', () => {
    const errors = validateWindowsConfig(
      {
        windows: {
          a: { renderer: 'missing-a', standalone: { port: 5174 } },
          b: { renderer: 'missing-b', standalone: { port: 5174 } },
        },
        apiTargets: {},
      },
      { type: 'object' },
      { subWebDir: '/no-such-sub-web', apiContext: {} },
    );
    expect(errors.some((error) => error.includes('standalone.port 5174'))).toBe(
      true,
    );
  });
});

describe('generateWindowsTypeScript', () => {
  it('emits window constants from config', () => {
    const source = generateWindowsTypeScript(
      {
        windows: {
          main: {
            preload: 'unified',
            renderer: 'frontend',
            preloadCapabilities: ['shell'],
          },
        },
      },
      { namespaces: { platform: { platform: '/api/platform' } } },
    );
    expect(source).toContain('GENERATED_WINDOWS');
    expect(source).toContain('frontend');
    expect(source).toContain('/api/platform');
    expect(source).not.toContain('label:');
  });
});

describe('generateApiNamespacesSource', () => {
  it('emits namespace and target maps', () => {
    const source = generateApiNamespacesSource(
      { apiTargets: { platform: 'http://localhost:8090' } },
      { namespaces: { platform: { platform: '/api/platform' } } },
    );
    expect(source).toContain('GENERATED_API_TARGETS');
    expect(source).toContain('8090');
  });

  it('emits federation dev entries from standalone windows', () => {
    const source = generateApiNamespacesSource(
      {
        shell: { web: { host: 'localhost', port: 5173 } },
        windows: {
          docs: {
            renderer: 'docs',
            webLoad: 'federation',
            standalone: { port: 5176, basePath: '/' },
          },
        },
        apiTargets: {},
      },
      { namespaces: {} },
    );
    expect(source).toContain('GENERATED_FEDERATION_DEV_ENTRIES');
    expect(source).toContain('nebula_docs');
    expect(source).toContain('mf-manifest.json');
  });
});
