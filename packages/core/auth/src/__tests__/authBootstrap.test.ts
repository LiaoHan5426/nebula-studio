import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthBootstrap } from '../AuthBootstrap';

// Mock 外部依赖
vi.mock('@nebula-studio/auth-provider/session', () => ({
  hasValidAuthToken: vi.fn(() => false),
  setAuthSession: vi.fn(),
  getAuthToken: vi.fn(() => null),
}));

vi.mock('@nebula-studio/auth-provider', () => ({
  globalAuthProvider: {
    setSession: vi.fn(),
    clearSession: vi.fn(),
  },
}));

vi.mock('@nebula-studio/app-shell', () => ({
  readParentShellAuthSession: vi.fn(() => null),
  isSurfaceEmbed: vi.fn(() => false),
  SHELL_AUTH_UNAUTHORIZED_EVENT: 'shell:auth:unauthorized',
}));

const { hasValidAuthToken } =
  await import('@nebula-studio/auth-provider/session');
const mockHasValidAuthToken = vi.mocked(hasValidAuthToken);

describe('authBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register()', () => {
    it('standalone: returns a dispose function', async () => {
      const { dispose } = await AuthBootstrap.register('standalone');
      expect(typeof dispose).toBe('function');
      dispose();
    });

    it('platform-embed: returns a dispose function', async () => {
      const { dispose } = await AuthBootstrap.register('platform-embed', {
        appId: 'integration',
      });
      expect(typeof dispose).toBe('function');
      dispose();
    });

    it('electron: returns a dispose function', async () => {
      const { dispose } = await AuthBootstrap.register('electron');
      expect(typeof dispose).toBe('function');
      dispose();
    });

    it('calls onAuthFailed when embed strategy returns false', async () => {
      mockHasValidAuthToken.mockReturnValue(false);
      const onAuthFailed = vi.fn();

      const { ok } = await AuthBootstrap.register('platform-embed', {
        appId: 'integration',
        onAuthFailed,
      });

      expect(ok).toBe(false);
      expect(onAuthFailed).toHaveBeenCalled();
    });

    it('does not call onAuthFailed when standalone returns true', async () => {
      const onAuthFailed = vi.fn();

      await AuthBootstrap.register('standalone', { onAuthFailed });

      // standalone always returns true (router guard handles redirect)
      expect(onAuthFailed).not.toHaveBeenCalled();
    });
  });
});

describe('standaloneStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bootstrap always returns true (router guard handles redirect)', async () => {
    const { StandaloneStrategy } = await import('../strategies/standalone');
    const strategy = new StandaloneStrategy();
    const result = await strategy.bootstrap();
    expect(result).toBe(true);
  });

  it('createRouterGuard redirects unauthenticated to login', async () => {
    mockHasValidAuthToken.mockReturnValue(false);
    const { StandaloneStrategy } = await import('../strategies/standalone');
    const strategy = new StandaloneStrategy();
    await strategy.bootstrap({ loginRoutePath: '/login' });

    const guard = strategy.createRouterGuard();
    const result = guard({ path: '/dashboard', meta: {} });

    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toContain('/login');
    expect(result.redirectTo).toContain(encodeURIComponent('/dashboard'));
  });

  it('createRouterGuard allows authenticated access', async () => {
    mockHasValidAuthToken.mockReturnValue(true);
    const { StandaloneStrategy } = await import('../strategies/standalone');
    const strategy = new StandaloneStrategy();
    await strategy.bootstrap();

    const guard = strategy.createRouterGuard();
    const result = guard({ path: '/dashboard', meta: {} });

    expect(result.authenticated).toBe(true);
  });

  it('createRouterGuard allows public routes without token', async () => {
    mockHasValidAuthToken.mockReturnValue(false);
    const { StandaloneStrategy } = await import('../strategies/standalone');
    const strategy = new StandaloneStrategy();
    await strategy.bootstrap();

    const guard = strategy.createRouterGuard();
    const result = guard({ path: '/login', meta: { public: true } });

    expect(result.authenticated).toBe(true);
  });
});

describe('embedStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispose cleans up event listeners', async () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const { EmbedStrategy } = await import('../strategies/embed');
    const strategy = new EmbedStrategy();
    await strategy.bootstrap({ appId: 'integration' });

    // dispose should remove listeners
    strategy.dispose();

    // At least the SHELL_AUTH_UNAUTHORIZED_EVENT listener should be removed
    expect(removeEventSpy).toHaveBeenCalled();

    addEventSpy.mockRestore();
    removeEventSpy.mockRestore();
  });

  it('returns false when no session available', async () => {
    mockHasValidAuthToken.mockReturnValue(false);
    const { EmbedStrategy } = await import('../strategies/embed');
    const strategy = new EmbedStrategy();
    const result = await strategy.bootstrap();
    expect(result).toBe(false);
    strategy.dispose();
  });
});

describe('electronStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no electron API by default
    delete (globalThis as Record<string, unknown>).electron;
  });

  it('falls back to hasValidAuthToken when no electron API', async () => {
    mockHasValidAuthToken.mockReturnValue(false);
    const { ElectronStrategy } = await import('../strategies/electron');
    const strategy = new ElectronStrategy();
    const result = await strategy.bootstrap();
    expect(result).toBe(false);
  });

  it('reads session from IPC and returns true', async () => {
    mockHasValidAuthToken.mockReturnValue(false);

    const mockIpcRenderer = {
      invoke: vi.fn().mockResolvedValue({ user: 'admin', token: 'jwt-token' }),
      on: vi.fn(),
      removeListener: vi.fn(),
    };
    (globalThis as Record<string, unknown>).electron = {
      ipcRenderer: mockIpcRenderer,
    };

    const { ElectronStrategy } = await import('../strategies/electron');
    const strategy = new ElectronStrategy();
    await strategy.bootstrap();

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('auth:get-session');
    expect(mockIpcRenderer.on).toHaveBeenCalledWith(
      'auth:session-changed',
      expect.any(Function),
    );

    strategy.dispose();
    delete (globalThis as Record<string, unknown>).electron;
  });

  it('dispose cleans up IPC and window listeners', async () => {
    const mockIpcRenderer = {
      invoke: vi.fn().mockResolvedValue(null),
      on: vi.fn(),
      removeListener: vi.fn(),
    };
    (globalThis as Record<string, unknown>).electron = {
      ipcRenderer: mockIpcRenderer,
    };

    const { ElectronStrategy } = await import('../strategies/electron');
    const strategy = new ElectronStrategy();
    await strategy.bootstrap();
    strategy.dispose();

    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
      'auth:session-changed',
      expect.any(Function),
    );

    delete (globalThis as Record<string, unknown>).electron;
  });
});
