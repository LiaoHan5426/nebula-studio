import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootMicroApp } from '@nebula-studio/runtime';
import { bootFrontend } from '../boot';

vi.mock('@nebula-studio/nebula-ui', () => ({}));
vi.mock('@nebula-studio/nebula-layout', () => ({}));
vi.mock('@nebula-studio-internal/tailwind/electron', () => ({}));
vi.mock('../App.vue', () => ({ default: {} }));
vi.mock('../platform/integratedApps', () => ({
  bootstrapShellIntegratedApps: vi.fn(),
}));
vi.mock('@nebula-studio/app-shell', () => ({
  redirectShellToWebLogin: vi.fn(),
  resolveShellEventBus: vi.fn(() => ({})),
  shouldRedirectUnauthenticatedWebShell: vi.fn(() => false),
}));
vi.mock('@nebula-studio/runtime', () => ({
  bootMicroApp: vi.fn(),
  detectRuntimeMode: vi.fn(() => 'standalone'),
}));

const mockBootMicroApp = vi.mocked(bootMicroApp);

describe('bootFrontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Reflect.set(globalThis, '__NEBULA_MSW_ENABLED__', false);
    Reflect.set(globalThis, '__NEBULA_BUILD_NODE_VERSION__', 'test');
  });

  it('mounts the Electron shell without requiring an existing session', async () => {
    await bootFrontend({ mode: 'electron' });

    expect(mockBootMicroApp).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'electron',
        auth: { enabled: false },
      }),
    );
  });

  it('keeps authentication enabled for web modes', async () => {
    await bootFrontend({ mode: 'standalone' });

    expect(mockBootMicroApp).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'standalone',
        auth: { enabled: true },
      }),
    );
  });
});
