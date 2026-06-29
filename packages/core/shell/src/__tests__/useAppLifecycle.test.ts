/**
 * useAppLifecycle 单元测试。
 *
 * Plan-11 Task 2: 测试视图切换 / 标签管理 / 偏好。
 */
import { describe, expect, it, vi } from 'vitest';
import { useAppLifecycle } from '../composables/useAppLifecycle.js';

vi.mock('@nebula-studio/app-shell', () => ({
  SHELL_SURFACE_WORKSPACE: 'workspace',
  WEB_SHELL_EMBED_QUERY: 'nebula_embed',
  clearWebAuthSession: vi.fn(),
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
  getShellIntegratedAppMeta: vi.fn((id: string) => ({ label: id })),
  hasValidShellAuthSession: vi.fn(() => false),
  isShellIntegrableAppId: vi.fn((id: string) => id !== 'workspace'),
  isShellIntegratableAppId: vi.fn(
    (id: string) => id !== 'workspace' && id !== 'settings',
  ),
  persistShellSurfacePreference: vi.fn(),
  postShellEmbedReset: vi.fn(),
  shellPresentationConfig: { shell: { topInsetPx: 48 } },
  writeWebAuthSession: vi.fn(),
}));

vi.mock('@nebula-studio/nebula-layout', () => ({
  ACCENT_PRESETS: [{ id: 'default', primary: '#3b82f6' }],
}));

function createLifecycleOpts() {
  return {
    getAuthSession: vi.fn(() => null),
    setAuthSession: vi.fn(),
    openLogin: vi.fn(async () => {}),
    refreshAuthSession: vi.fn(async () => {}),
    resetOrganizationSession: vi.fn(),
    layoutPreferences: {
      themeMode: 'dark',
      accentPreset: 'default',
      collapsed: false,
    },
  };
}

describe('useAppLifecycle', () => {
  it('initializes with default state', () => {
    const opts = createLifecycleOpts();
    const lc = useAppLifecycle(opts);

    expect(lc.theme.value).toBe('dark');
    expect(lc.activeViewId.value).toBeNull();
    expect(lc.selectedSidebarItem.value).toBe('workspace');
    expect(lc.availableViewIds.value).toEqual([]);
  });

  it('computes shell tags with workspace always present', () => {
    const opts = createLifecycleOpts();
    const lc = useAppLifecycle(opts);

    const tags = lc.shellTags.value;
    expect(tags.length).toBeGreaterThanOrEqual(1);
    expect(tags[0].key).toBe('workspace');
    expect(tags[0].label).toBe('工作台');
  });

  it('computes breadcrumb items for workspace', () => {
    const opts = createLifecycleOpts();
    const lc = useAppLifecycle(opts);

    const crumbs = lc.shellBreadcrumbItems.value;
    expect(crumbs.length).toBe(1);
    expect(crumbs[0].label).toBe('工作台');
  });

  it('showShellTagsBar is true when integration is closed', () => {
    const opts = createLifecycleOpts();
    const lc = useAppLifecycle(opts);

    expect(lc.showShellTagsBar.value).toBe(true);
  });

  it('activeShellTagKey defaults to workspace', () => {
    const opts = createLifecycleOpts();
    const lc = useAppLifecycle(opts);

    expect(lc.activeShellTagKey.value).toBe('workspace');
  });
});
