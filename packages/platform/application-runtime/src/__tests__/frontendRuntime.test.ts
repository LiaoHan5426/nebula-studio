import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  federationRegistrationFromRuntime,
  fetchFrontendRuntimeEntries,
  findFederationRuntimeEntry,
  localDocsFederationRegistration,
  localFederationRegistration,
  normalizeExposedModule,
  iframeRegistrationFromRuntime,
  resolveExternalHref,
  resolveIframeSrc,
} from '../frontendRuntime.ts';

const docsEntry: FrontendRuntimeEntry = {
  category: 'shell',
  contractVersion: 1,
  driver: 'federation',
  electronEnabled: true,
  exposedModule: './application',
  id: 'docs',
  manifestUrl: 'http://localhost:5176/mf-manifest.json',
  name: '文档',
  remoteName: 'nebula_docs',
  roles: ['public'],
  source: 'frontend',
  webEnabled: true,
};

describe('frontend runtime registry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes exposed modules', () => {
    expect(normalizeExposedModule('./application')).toBe('application');
    expect(normalizeExposedModule('application')).toBe('application');
    expect(normalizeExposedModule()).toBe('application');
  });

  it('picks federation entries by id', () => {
    expect(
      findFederationRuntimeEntry(
        [docsEntry, { ...docsEntry, id: 'settings', driver: 'native' }],
        'docs',
      ),
    ).toBe(docsEntry);
    expect(findFederationRuntimeEntry([docsEntry], 'settings')).toBeUndefined();
  });

  it('maps a runtime row to a federation registration', () => {
    expect(federationRegistrationFromRuntime(docsEntry)).toEqual({
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/mf-manifest.json',
    });
    expect(
      federationRegistrationFromRuntime({
        ...docsEntry,
        integrity: 'sha384-abc',
        signature: 'nebula-sig-v1;alg=ECDSA-P256-SHA256;pk=abc;sig=def',
        version: '1.0.0',
      }),
    ).toMatchObject({
      integrity: 'sha384-abc',
      signature: 'nebula-sig-v1;alg=ECDSA-P256-SHA256;pk=abc;sig=def',
      version: '1.0.0',
    });
  });

  it('loads runtime entries from the system API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ code: 200, success: true, data: [docsEntry] }),
      }),
    );
    await expect(
      fetchFrontendRuntimeEntries({ token: 'tok', tenantId: 'tenant-a' }),
    ).resolves.toEqual([docsEntry]);
    expect(fetch).toHaveBeenCalledWith('/api/system/frontend-apps/runtime', {
      headers: expect.any(Headers),
    });
  });

  it('keeps a local docs fallback for offline Host boot', () => {
    expect(localDocsFederationRegistration().name).toBe('nebula_docs');
  });

  it('keeps a local settings fallback for offline Host boot', () => {
    expect(localFederationRegistration('settings').name).toBe(
      'nebula_settings',
    );
    expect(localFederationRegistration('settings').entry).toBe(
      'http://localhost:5177/mf-manifest.json',
    );
  });

  it('keeps a local integration fallback for offline Host boot', () => {
    expect(localFederationRegistration('integration').name).toBe(
      'nebula_integration',
    );
    expect(localFederationRegistration('integration').entry).toBe(
      'http://localhost:5174/mf-manifest.json',
    );
  });

  it('maps iframe runtime rows to same-origin guest urls', () => {
    const iframeEntry: FrontendRuntimeEntry = {
      ...docsEntry,
      id: 'iframe-demo',
      driver: 'iframe',
      manifestUrl: '/iframe-guest.html',
    };
    expect(resolveIframeSrc(iframeEntry, 'http://localhost:5173')).toBe(
      'http://localhost:5173/iframe-guest.html',
    );
    expect(
      iframeRegistrationFromRuntime(iframeEntry, 'http://localhost:5173'),
    ).toEqual({
      src: 'http://localhost:5173/iframe-guest.html',
      allowedOrigin: 'http://localhost:5173',
    });
  });

  it('maps cross-origin loopback iframe rows and rejects *', () => {
    const iframeEntry: FrontendRuntimeEntry = {
      ...docsEntry,
      id: 'iframe-cross-demo',
      driver: 'iframe',
      manifestUrl: 'http://127.0.0.1:5173/iframe-guest.html',
      allowedOrigins: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5175',
        'http://127.0.0.1:5175',
      ],
    };
    expect(resolveIframeSrc(iframeEntry, 'http://localhost:5175')).toBe(
      'http://127.0.0.1:5175/iframe-guest.html',
    );
    expect(
      iframeRegistrationFromRuntime(iframeEntry, 'http://localhost:5175'),
    ).toEqual({
      src: 'http://127.0.0.1:5175/iframe-guest.html',
      allowedOrigin: 'http://127.0.0.1:5175',
    });
    expect(() =>
      iframeRegistrationFromRuntime(
        { ...iframeEntry, allowedOrigins: ['*'] },
        'http://localhost:5173',
      ),
    ).toThrow(/allowedOrigins/);
  });

  it('rejects relative urls for the external driver', () => {
    const externalEntry: FrontendRuntimeEntry = {
      ...docsEntry,
      id: 'external-demo',
      driver: 'external',
      manifestUrl: '/iframe-guest.html',
    };
    expect(() => resolveExternalHref(externalEntry)).toThrow(/absolute url/);
  });
});
