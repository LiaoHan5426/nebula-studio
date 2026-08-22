import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetActiveMicroAppHandleForTests,
  bootMicroApp,
} from '../bootMicroApp';
import {
  __resetResolvedRuntimeModeForTests,
  getResolvedRuntimeMode,
  requireRuntimeMode,
  stampFederationRuntimeMode,
} from '@nebula-studio/shell-protocol';

vi.mock('@nebula-studio-electron/electron-bridge/vue', () => ({
  bootSubApp: vi.fn(() => ({
    unmount: vi.fn(),
  })),
}));

const mockBootSubApp = vi.mocked(bootSubApp);

describe('requireRuntimeMode', () => {
  beforeEach(() => {
    delete (window as { __NEBULA_RUNTIME_MODE__?: string })
      .__NEBULA_RUNTIME_MODE__;
  });

  it('returns an explicit mode', () => {
    expect(requireRuntimeMode('platform-embed')).toBe('platform-embed');
  });

  it('reads a stamped window mode', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'standalone';
    expect(requireRuntimeMode()).toBe('standalone');
  });

  it('throws when nothing is stamped', () => {
    expect(() => requireRuntimeMode()).toThrow(/must be stamped/);
  });
});

describe('getResolvedRuntimeMode', () => {
  beforeEach(() => {
    __resetResolvedRuntimeModeForTests();
  });

  it('reads a window stamp without bootMicroApp', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'platform-embed';
    expect(getResolvedRuntimeMode()).toBe('platform-embed');
  });
});

describe('stampFederationRuntimeMode', () => {
  beforeEach(() => {
    delete (window as { __NEBULA_RUNTIME_MODE__?: string })
      .__NEBULA_RUNTIME_MODE__;
  });

  it('stamps platform-embed when nothing is set', () => {
    expect(stampFederationRuntimeMode()).toBe('platform-embed');
    expect(window.__NEBULA_RUNTIME_MODE__).toBe('platform-embed');
  });

  it('keeps an existing electron stamp', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'electron';
    expect(stampFederationRuntimeMode()).toBe('electron');
  });
});

describe('bootMicroApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetActiveMicroAppHandleForTests();
    __resetResolvedRuntimeModeForTests();
    delete (window as { __NEBULA_RUNTIME_MODE__?: string })
      .__NEBULA_RUNTIME_MODE__;
  });

  const dummyComponent = { template: '<div>Test</div>' };

  it('standalone: mounts via bootSubApp without installing web presentation', async () => {
    await bootMicroApp({
      appId: 'test-app',
      mode: 'standalone',
      rootComponent: dummyComponent,
    });

    expect(mockBootSubApp).toHaveBeenCalled();
    expect(window.__NEBULA_RUNTIME_MODE__).toBe('standalone');
    expect(getResolvedRuntimeMode()).toBe('standalone');
  });

  it('platform-embed: mounts via bootSubApp', async () => {
    await bootMicroApp({
      appId: 'test-app',
      mode: 'platform-embed',
      rootComponent: dummyComponent,
    });

    expect(mockBootSubApp).toHaveBeenCalled();
  });

  it('electron: mounts via bootSubApp', async () => {
    await bootMicroApp({
      appId: 'test-app',
      mode: 'electron',
      rootComponent: dummyComponent,
    });

    expect(mockBootSubApp).toHaveBeenCalled();
  });

  it('auth.bootstrap returns false: does not mount, calls onAuthFailed', async () => {
    const onAuthFailed = vi.fn();

    const handle = await bootMicroApp({
      appId: 'test-app',
      mode: 'standalone',
      rootComponent: dummyComponent,
      auth: { bootstrap: async () => false },
      onAuthFailed,
    });

    expect(handle).toBeUndefined();
    expect(mockBootSubApp).not.toHaveBeenCalled();
    expect(onAuthFailed).toHaveBeenCalled();
  });

  it('returns MicroAppHandle with dispose that unmounts app', async () => {
    const unmount = vi.fn();
    mockBootSubApp.mockReturnValue({ unmount } as never);

    const handle = await bootMicroApp({
      appId: 'test-app',
      mode: 'standalone',
      rootComponent: dummyComponent,
    });

    expect(handle).toBeDefined();
    assert(handle);
    handle.dispose();
    expect(unmount).toHaveBeenCalled();
  });
});
