import { assert, describe, it, expect, vi, beforeEach } from 'vitest';
import {
  bootMicroApp,
  __resetActiveMicroAppHandleForTests,
} from '../bootMicroApp';
import { detectRuntimeMode } from '../detectMode';
import { installWebPresentation } from '@nebula-studio/app-shell';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';

// Mock 外部依赖（vitest 自动提升 vi.mock 到模块顶部）
vi.mock('@nebula-studio/app-shell', () => ({
  installWebPresentation: vi.fn(),
}));

vi.mock('@nebula-studio-electron/electron-bridge/vue', () => ({
  bootSubApp: vi.fn(() => ({
    unmount: vi.fn(),
  })),
}));

const mockInstallWebPresentation = vi.mocked(installWebPresentation);
const mockBootSubApp = vi.mocked(bootSubApp);

describe('detectRuntimeMode', () => {
  beforeEach(() => {
    delete (window as any).__NEBULA_RUNTIME_MODE__;
    delete (window as any).__NEBULA_PRESENTATION_HOST__;
    Reflect.deleteProperty(window, 'electron');
  });

  it('returns injected mode when __NEBULA_RUNTIME_MODE__ is set', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'platform-embed';
    expect(detectRuntimeMode()).toBe('platform-embed');
  });

  it('returns electron when window.electron exists without web mark', () => {
    Reflect.set(window, 'electron', {});
    expect(detectRuntimeMode()).toBe('electron');
  });

  it('returns standalone when window.electron exists but web mark is set', () => {
    Reflect.set(window, 'electron', {});
    window.__NEBULA_PRESENTATION_HOST__ = 'web';
    expect(detectRuntimeMode()).toBe('standalone');
  });

  it('returns standalone by default', () => {
    expect(detectRuntimeMode()).toBe('standalone');
  });
});

describe('bootMicroApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetActiveMicroAppHandleForTests();
    delete (window as any).__NEBULA_RUNTIME_MODE__;
    delete (window as any).__NEBULA_PRESENTATION_HOST__;
    Reflect.deleteProperty(window, 'electron');
  });

  const dummyComponent = { template: '<div>Test</div>' };

  it('standalone: calls installWebPresentation and bootSubApp', async () => {
    await bootMicroApp({
      appId: 'test-app',
      mode: 'standalone',
      rootComponent: dummyComponent,
      webPresentation: { scope: 'test-scope' },
    });

    expect(mockInstallWebPresentation).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'test-scope' }),
    );
    expect(mockBootSubApp).toHaveBeenCalled();
  });

  it('platform-embed: calls installWebPresentation and bootSubApp', async () => {
    const callOrder: string[] = [];
    mockInstallWebPresentation.mockImplementation(() => {
      callOrder.push('installWebPresentation');
    });
    mockBootSubApp.mockImplementation(() => {
      callOrder.push('bootSubApp');
    });

    await bootMicroApp({
      appId: 'test-app',
      mode: 'platform-embed',
      rootComponent: dummyComponent,
      webPresentation: { scope: 'web-embed-test' },
    });

    expect(callOrder).toEqual(['installWebPresentation', 'bootSubApp']);
  });

  it('electron: does NOT call installWebPresentation', async () => {
    await bootMicroApp({
      appId: 'test-app',
      mode: 'electron',
      rootComponent: dummyComponent,
      webPresentation: { scope: 'should-not-be-used' },
    });

    expect(mockInstallWebPresentation).not.toHaveBeenCalled();
    expect(mockBootSubApp).toHaveBeenCalled();
  });

  it('auth.bootstrap returns false: does not mount, calls onAuthFailed', async () => {
    const onAuthFailed = vi.fn();

    const handle = await bootMicroApp({
      appId: 'test-app',
      mode: 'standalone',
      rootComponent: dummyComponent,
      webPresentation: { scope: 'test' },
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
      webPresentation: { scope: 'test' },
    });

    expect(handle).toBeDefined();
    assert(handle);
    handle.dispose();
    expect(unmount).toHaveBeenCalled();
  });
});
