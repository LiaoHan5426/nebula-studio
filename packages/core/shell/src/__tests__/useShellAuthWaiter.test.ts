/**
 * useShellAuthWaiter 单元测试。
 *
 * Plan-11 Task 2: 测试认证等待 / 超时 / 清除场景。
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useShellAuthWaiter } from '../composables/useShellAuthWaiter.js';

// Mock @nebula-studio/app-shell
vi.mock('@nebula-studio/app-shell', () => ({
  clearWebAuthSession: vi.fn(),
  embeddedViewRequiresShellAuth: vi.fn((id: string) => id === 'secure-view'),
  getShellHostBridge: vi.fn(() => ({
    kind: 'electron',
    usesIframeEmbed: false,
  })),
  hasValidShellAuthSession: vi.fn((s: any) => !!s?.user),
  readWebAuthSession: vi.fn(() => null),
}));

function createOpts(
  overrides?: Partial<Parameters<typeof useShellAuthWaiter>[0]>,
) {
  let session: { user: string; token?: string } | null = null;
  return {
    getAuthSession: vi.fn(() => session),
    setAuthSession: vi.fn((s: any) => {
      session = s;
    }),
    openLogin: vi.fn(async () => {}),
    refreshAuthSession: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('useShellAuthWaiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolves immediately when session already valid', async () => {
    const opts = createOpts();
    (opts.getAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: 'admin',
    });
    const { hasAuthenticatedShellSession } = useShellAuthWaiter(opts);
    expect(hasAuthenticatedShellSession()).toBe(true);
  });

  it('waits for auth and resolves when waiter is notified', async () => {
    const opts = createOpts();
    const { waitForShellAuthSession, resolveShellAuthLoginWaiters } =
      useShellAuthWaiter(opts);

    const promise = waitForShellAuthSession();
    // Simulate login success
    resolveShellAuthLoginWaiters(true);
    const result = await promise;
    expect(result).toBe(true);
  });

  it('times out after SHELL_AUTH_WAIT_TIMEOUT_MS', async () => {
    const opts = createOpts();
    const { waitForShellAuthSession } = useShellAuthWaiter(opts);

    const promise = waitForShellAuthSession();
    vi.advanceTimersByTime(120_000);
    const result = await promise;
    expect(result).toBe(false);
  });

  it('clears auth session via clearShellAuthSession', async () => {
    const { clearWebAuthSession } = await import('@nebula-studio/app-shell');
    const opts = createOpts();
    const { clearShellAuthSession } = useShellAuthWaiter(opts);

    clearShellAuthSession();
    expect(opts.setAuthSession).toHaveBeenCalledWith(null);
    expect(clearWebAuthSession).toHaveBeenCalled();
  });

  it('skips auth for non-electron hosts', async () => {
    const { getShellHostBridge } = await import('@nebula-studio/app-shell');
    vi.mocked(getShellHostBridge).mockReturnValue({
      kind: 'web',
      usesIframeEmbed: true,
    } as any);

    const opts = createOpts();
    const { ensureShellAuthForEmbeddedView } = useShellAuthWaiter(opts);
    const result = await ensureShellAuthForEmbeddedView('secure-view');
    expect(result).toBe(true);
  });
});
