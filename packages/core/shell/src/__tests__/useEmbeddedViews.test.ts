/**
 * useEmbeddedViews 单元测试。
 *
 * Plan-11 Task 2: 测试 iframe src 构建 / 加载状态。
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useEmbeddedViews } from '../composables/useEmbeddedViews.js';

vi.mock('@nebula-studio/app-shell', () => ({
  WEB_SHELL_EMBED_QUERY: 'nebula_embed',
  getEmbeddedShellWindowIds: vi.fn(() => ['integration', 'settings']),
  getShellHostBridge: vi.fn(() => ({
    kind: 'web',
    usesIframeEmbed: true,
    commitIntegrationOpen: vi.fn(),
    persistIntegrationOpenFromWatch: vi.fn(),
    resolveInitialIntegrationOpen: vi.fn(() => false),
    onBeforeShellHydrate: vi.fn(),
    finalizeActiveViewOnMount: vi.fn(),
    shouldRestoreActiveViewFromPreference: false,
    shouldPersistActiveViewPreference: false,
    shouldRefreshAuthSessionAfterLogout: false,
    shouldSubscribeAuthSessionChannel: false,
    onShellUnmount: vi.fn(),
  })),
}));

describe('useEmbeddedViews', () => {
  beforeEach(() => {
    vi.stubGlobal('import', { meta: { env: { BASE_URL: '/' } } });
  });

  it('builds embed src for each embedded view id', () => {
    const { embedSrc } = useEmbeddedViews({
      integrationOpen: { value: false },
    });
    const src = embedSrc.value;
    expect(src).toHaveProperty('integration');
    expect(src).toHaveProperty('settings');
    expect(src.integration).toContain('nebula_embed=integration');
    expect(src.settings).toContain('nebula_embed=settings');
  });

  it('manages loaded and ready state', () => {
    const { markEmbedLoaded, markEmbedReady, isEmbedLoaded, isEmbedReady } =
      useEmbeddedViews({ integrationOpen: { value: false } });

    expect(isEmbedLoaded('test')).toBe(false);
    expect(isEmbedReady('test')).toBe(false);

    markEmbedLoaded('test');
    expect(isEmbedLoaded('test')).toBe(true);

    markEmbedReady('test');
    expect(isEmbedReady('test')).toBe(true);
  });

  it('tracks embed loading view id', () => {
    const { embedLoadingViewId } = useEmbeddedViews({
      integrationOpen: { value: false },
    });
    expect(embedLoadingViewId.value).toBeNull();
  });
});
