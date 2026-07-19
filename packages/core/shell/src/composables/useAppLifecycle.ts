/**
 * Shell 生命周期 composable。
 *
 * Plan-11 Task 0: 从 `frontend/App.vue` 提取生命周期胶水逻辑。
 * 编排 useEmbeddedViews / useAppIntegration / useShellAuthWaiter，
 * 并管理主题、标签、面包屑、认证会话、IPC 事件等。
 */
import {
  SHELL_SURFACE_WORKSPACE,
  WEB_SHELL_EMBED_QUERY,
  clearWebAuthSession,
  getShellHostBridge,
  getShellIntegratedAppMeta,
  hasValidShellAuthSession,
  isShellIntegrableAppId,
  isShellStandaloneSidebarApp,
  postShellEmbedReset,
  shellPresentationConfig,
  writeWebAuthSession,
} from '@nebula-studio/app-shell';
import type {
  EmbeddedShellWindowId,
  ShellAuthSessionPayload,
} from '@nebula-studio/app-shell';
import { ACCENT_PRESETS } from '@nebula-studio/nebula-layout';
import type { BreadcrumbSegment } from '@nebula-studio/nebula-layout';
import { computed, ref, watch } from 'vue';

import { useAppIntegration } from './useAppIntegration.js';
import { useEmbeddedViews } from './useEmbeddedViews.js';
import { useShellAuthWaiter } from './useShellAuthWaiter.js';

export type ThemeMode = 'light' | 'dark';
export type AppMode = 'dev' | 'build';

export interface UseAppLifecycleOptions {
  getAuthSession: () => ShellAuthSessionPayload | null;
  setAuthSession: (s: ShellAuthSessionPayload | null) => void;
  openLogin: () => Promise<void>;
  refreshAuthSession: () => Promise<void>;
  resetOrganizationSession: () => void;
  layoutPreferences: {
    themeMode: string;
    accentPreset: string;
    collapsed: boolean;
  };
}

export function useAppLifecycle(opts: UseAppLifecycleOptions) {
  const shellTopPx = shellPresentationConfig.shell.topInsetPx;
  const shellHost = getShellHostBridge();
  const usesIframeEmbed = shellHost.usesIframeEmbed;

  // ─── Core state ────────────────────────────────────────
  const appMode = ref<AppMode>('build');
  const theme = ref<ThemeMode>('dark');
  const availableViewIds = ref<string[]>([]);
  const dormantIntegrableIds = ref<string[]>([]);
  const activeViewId = ref<string | null>(null);
  const selectedSidebarItem = ref('workspace');
  const activeViewPersistReady = ref(false);
  const sortableViewIds = ref<string[]>([]);
  const isThemeSwitching = ref(false);
  const isSorting = ref(false);
  const preferencesOpen = ref(false);

  // ─── Embedded views ────────────────────────────────────
  const integrationOpenRef = ref(false);
  const embedded = useEmbeddedViews({ integrationOpen: integrationOpenRef });

  // ─── Auth waiter ───────────────────────────────────────
  const authWaiter = useShellAuthWaiter({
    getAuthSession: opts.getAuthSession,
    setAuthSession: opts.setAuthSession,
    openLogin: opts.openLogin,
    refreshAuthSession: opts.refreshAuthSession,
  });

  // ─── Embed helpers (needed by integration) ─────────────
  function getEmbedIframe(viewId: string): HTMLIFrameElement | null {
    return document.querySelector<HTMLIFrameElement>(
      `.shell-embed iframe[title="Nebula Studio — ${viewId}"]`,
    );
  }

  async function completeEmbedSurfaceLoading(viewId: string): Promise<void> {
    const startedAt =
      embedded.embedLoadStartedAtByViewId.get(viewId) ?? Date.now();
    const remain =
      embedded.EMBED_SURFACE_MIN_LOADING_MS - (Date.now() - startedAt);
    if (remain > 0)
      await new Promise<void>((r) => window.setTimeout(r, remain));
    embedded.embedReadyViewIds.value = new Set([
      ...embedded.embedReadyViewIds.value,
      viewId,
    ]);
    embedded.embedLoadStartedAtByViewId.delete(viewId);
    const pending = embedded.embedLoadTimeoutByViewId.get(viewId);
    if (pending !== undefined) {
      window.clearTimeout(pending);
      embedded.embedLoadTimeoutByViewId.delete(viewId);
    }
    if (embedded.embedLoadingViewId.value === viewId)
      embedded.embedLoadingViewId.value = null;
  }

  function beginEmbedSurfaceLoading(viewId: string): void {
    const pending = embedded.embedLoadTimeoutByViewId.get(viewId);
    if (pending !== undefined) {
      window.clearTimeout(pending);
      embedded.embedLoadTimeoutByViewId.delete(viewId);
    }
    embedded.embedLoadStartedAtByViewId.set(viewId, Date.now());
    embedded.embedLoadingViewId.value = viewId;
    const timeout = window.setTimeout(() => {
      embedded.embedLoadTimeoutByViewId.delete(viewId);
      void completeEmbedSurfaceLoading(viewId);
    }, embedded.EMBED_SURFACE_LOAD_TIMEOUT_MS);
    embedded.embedLoadTimeoutByViewId.set(viewId, timeout);
  }

  function ensureEmbedSurfaceLoading(viewId: string | null | undefined): void {
    if (!viewId || embedded.embedReadyViewIds.value.has(viewId)) return;
    beginEmbedSurfaceLoading(viewId);
    if (!usesIframeEmbed) void completeEmbedSurfaceLoading(viewId);
  }

  function tryCompleteEmbedFromExistingFrame(viewId: string): void {
    const iframe = getEmbedIframe(viewId);
    if (iframe?.contentDocument?.readyState === 'complete')
      void completeEmbedSurfaceLoading(viewId);
  }

  function resetIntegrableEmbedOnLeave(viewId: string | null): void {
    if (!usesIframeEmbed || !viewId || !isShellIntegrableAppId(viewId)) return;
    postShellEmbedReset(getEmbedIframe(viewId)?.contentWindow ?? null);
  }

  // ─── IPC view operations ───────────────────────────────
  async function switchEmbeddedView(viewId: string): Promise<void> {
    if (!(await authWaiter.ensureShellAuthForEmbeddedView(viewId))) return;
    if (!usesIframeEmbed) reportShellViewport();
    const ok = await window.electron.ipcRenderer.invoke(
      'shell:set-active-view',
      { viewId },
    );
    if (ok) {
      activeViewId.value = viewId;
      syncSidebarSelection(viewId);
    }
  }

  async function enableEmbeddedView(viewId: string): Promise<boolean> {
    return Boolean(
      await window.electron.ipcRenderer.invoke('shell:enable-embedded-view', {
        viewId,
      }),
    );
  }
  async function disableEmbeddedView(viewId: string): Promise<boolean> {
    return Boolean(
      await window.electron.ipcRenderer.invoke('shell:disable-embedded-view', {
        viewId,
      }),
    );
  }
  async function reorderEmbeddedViews(ids: string[]): Promise<boolean> {
    return Boolean(
      await window.electron.ipcRenderer.invoke('shell:reorder-embedded-views', {
        orderedViewIds: ids,
      }),
    );
  }

  function syncSidebarSelection(viewId: string | null): void {
    if (!viewId) return;
    if (isShellStandaloneSidebarApp(viewId)) {
      selectedSidebarItem.value = viewId;
      return;
    }
    if (isShellIntegrableAppId(viewId)) {
      selectedSidebarItem.value = 'integration';
      return;
    }
    selectedSidebarItem.value = 'workspace';
  }

  // ─── Viewport ──────────────────────────────────────────
  function reportShellViewport(): void {
    if (usesIframeEmbed) return;
    const host = document.querySelector<HTMLElement>('.shell-embed-host');
    const rect = host?.getBoundingClientRect();
    window.electron.ipcRenderer.invoke('shell-viewport', {
      x: rect?.left ?? 0,
      y: rect?.top ?? shellTopPx,
      width: rect?.width ?? window.innerWidth,
      height: rect?.height ?? Math.max(0, window.innerHeight - shellTopPx),
    });
  }

  // ─── Shell state ───────────────────────────────────────
  async function loadShellState(): Promise<void> {
    const [state, nextTheme, nextMode] = (await Promise.all([
      window.electron.ipcRenderer.invoke('shell:get-state'),
      window.electron.ipcRenderer.invoke('settings:theme:get'),
      window.electron.ipcRenderer.invoke('shell:app-mode:get'),
    ])) as [Record<string, unknown>, string, string];
    availableViewIds.value = Array.isArray(state?.availableViewIds)
      ? (state.availableViewIds as string[])
      : [];
    sortableViewIds.value = [...availableViewIds.value];
    dormantIntegrableIds.value = Array.isArray(state?.dormantIntegrableIds)
      ? (state.dormantIntegrableIds as string[])
      : [];
    activeViewId.value =
      typeof state?.activeViewId === 'string' ? state.activeViewId : null;
    theme.value = nextTheme === 'light' ? 'light' : 'dark';
    opts.layoutPreferences.themeMode = theme.value;
    appMode.value = nextMode === 'dev' ? 'dev' : 'build';
    applyAccentPreset(opts.layoutPreferences.accentPreset);
  }

  // ─── Integration (uses helpers defined above) ──────────
  const integration = useAppIntegration({
    availableViewIds,
    sortableViewIds,
    activeViewId,
    loadedEmbedIds: embedded.loadedEmbedIds,
    embedReadyViewIds: embedded.embedReadyViewIds,
    embedLoadingViewId: embedded.embedLoadingViewId,
    selectedSidebarItem,
    shellHost,
    usesIframeEmbed,
    shellTopPx,
    switchEmbeddedView,
    syncSidebarSelection,
    enableEmbeddedView,
    disableEmbeddedView,
    reorderEmbeddedViews,
    loadShellState,
    ensureEmbedSurfaceLoading,
    tryCompleteEmbedFromExistingFrame,
    resetIntegrableEmbedOnLeave,
    reportShellViewport,
    getEmbedIframe,
  });

  // ─── Theme ─────────────────────────────────────────────
  function applyAccentPreset(presetId: string): void {
    const preset = ACCENT_PRESETS.find(
      (item: { id: string }) => item.id === presetId,
    );
    if (preset)
      document.documentElement.style.setProperty('--primary', preset.primary);
  }

  async function applyTheme(nextTheme: ThemeMode): Promise<void> {
    opts.layoutPreferences.themeMode = nextTheme;
    isThemeSwitching.value = true;
    theme.value = (await window.electron.ipcRenderer.invoke(
      'settings:theme:set',
      { theme: nextTheme },
    )) as ThemeMode;
    setTimeout(() => {
      isThemeSwitching.value = false;
    }, 220);
  }

  // ─── Tags ──────────────────────────────────────────────
  const visitedViewIds = ref<string[]>([]);

  /** 固定侧边栏标签（工作台 / 应用集成） */
  const FIXED_SIDEBAR_LABELS = {
    workspace: '工作台',
    integration: '应用集成',
  } as const;

  /**
   * 统一解析任意 viewId / sidebar key 的显示标签。
   * 固定项（workspace / integration）来自 `FIXED_SIDEBAR_LABELS`；
   * 独立侧边栏应用（`integratable: false`）与集成应用均来自 `windows.json` 注册元数据。
   */
  function resolveSidebarLabel(key: string): string {
    if (key in FIXED_SIDEBAR_LABELS)
      return FIXED_SIDEBAR_LABELS[key as keyof typeof FIXED_SIDEBAR_LABELS];
    if (isShellStandaloneSidebarApp(key) || isShellIntegrableAppId(key))
      return getShellIntegratedAppMeta(key).label;
    return key;
  }

  /** 兼容旧字段名，供模板与面包屑中使用 */
  const sidebarLabels = FIXED_SIDEBAR_LABELS;

  function resolveShellViewLabel(viewId: string): string {
    return resolveSidebarLabel(viewId);
  }

  /** 当前可用的独立侧边栏应用 ID 列表（由 `integratable: false` 自动推导） */
  const standaloneSidebarAppIds = computed(() =>
    availableViewIds.value.filter(isShellStandaloneSidebarApp),
  );

  const shellTags = computed(() => {
    const tags: Array<{ key: string; label: string }> = [
      { key: SHELL_SURFACE_WORKSPACE, label: sidebarLabels.workspace },
    ];
    for (const viewId of visitedViewIds.value)
      tags.push({ key: viewId, label: resolveShellViewLabel(viewId) });
    return tags;
  });

  const shellTagItems = computed(() =>
    shellTags.value.map((tag) => ({
      key: tag.key,
      label: tag.label,
      icon: tag.key === SHELL_SURFACE_WORKSPACE ? ('home' as const) : undefined,
      closable: tag.key !== SHELL_SURFACE_WORKSPACE,
    })),
  );

  const activeShellTagKey = computed(
    () => activeViewId.value ?? SHELL_SURFACE_WORKSPACE,
  );
  const showShellTagsBar = computed(() => !integration.integrationOpen.value);

  // ─── Breadcrumbs ───────────────────────────────────────
  const shellBreadcrumbItems = computed((): BreadcrumbSegment[] => {
    let trail: string[];
    if (integration.integrationOpen.value) {
      trail = [sidebarLabels.integration];
    } else if (activeViewId.value) {
      if (isShellIntegrableAppId(activeViewId.value))
        trail = [
          sidebarLabels.integration,
          getShellIntegratedAppMeta(activeViewId.value).label,
        ];
      else trail = [resolveSidebarLabel(activeViewId.value)];
    } else {
      trail = [resolveSidebarLabel(selectedSidebarItem.value)];
    }
    return trail.map((label, index) => {
      let icon: BreadcrumbSegment['icon'] = 'file';
      if (index === 0)
        icon =
          label === sidebarLabels.integration
            ? 'integration'
            : label === sidebarLabels.workspace
              ? 'home'
              : 'file';
      else if (label === sidebarLabels.integration) icon = 'integration';
      return { key: `${label}-${index}`, label, icon };
    });
  });

  // ─── Tag actions ───────────────────────────────────────
  function rememberVisitedView(viewId: string | null): void {
    if (!viewId || visitedViewIds.value.includes(viewId)) return;
    visitedViewIds.value = [...visitedViewIds.value, viewId];
  }

  function cleanupClosedShellTag(viewId: string): void {
    resetIntegrableEmbedOnLeave(viewId);
    if (embedded.loadedEmbedIds.value.has(viewId))
      embedded.loadedEmbedIds.value = new Set(
        [...embedded.loadedEmbedIds.value].filter((id) => id !== viewId),
      );
    if (embedded.embedReadyViewIds.value.has(viewId))
      embedded.embedReadyViewIds.value = new Set(
        [...embedded.embedReadyViewIds.value].filter((id) => id !== viewId),
      );
    const pending = embedded.embedLoadTimeoutByViewId.get(viewId);
    if (pending !== undefined) {
      window.clearTimeout(pending);
      embedded.embedLoadTimeoutByViewId.delete(viewId);
    }
    embedded.embedLoadStartedAtByViewId.delete(viewId);
    if (embedded.embedLoadingViewId.value === viewId)
      embedded.embedLoadingViewId.value = null;
  }

  function removeVisitedViews(ids: string[]): void {
    if (!ids.length) return;
    const removeSet = new Set(ids);
    for (const id of ids) cleanupClosedShellTag(id);
    visitedViewIds.value = visitedViewIds.value.filter(
      (id) => !removeSet.has(id),
    );
  }

  async function activateShellTag(key: string): Promise<void> {
    if (key === SHELL_SURFACE_WORKSPACE) {
      await integration.openWorkspace();
      return;
    }
    await integration.selectIntegratedApp(key);
  }

  async function closeShellTag(viewId: string): Promise<void> {
    if (viewId === SHELL_SURFACE_WORKSPACE) return;
    const idx = shellTags.value.findIndex((t) => t.key === viewId);
    if (idx < 0) return;
    const isActive = activeShellTagKey.value === viewId;
    removeVisitedViews([viewId]);
    if (!isActive) return;
    const fallbackIdx = Math.min(idx - 1, shellTags.value.length - 1);
    const fallbackKey =
      shellTags.value[fallbackIdx]?.key ?? SHELL_SURFACE_WORKSPACE;
    if (fallbackKey === SHELL_SURFACE_WORKSPACE)
      await integration.openWorkspace();
    else await integration.selectIntegratedApp(fallbackKey);
  }

  function closeShellTagsLeftOfAnchor(): void {
    const idx = shellTags.value.findIndex(
      (t) => t.key === activeShellTagKey.value,
    );
    if (idx <= 1) return;
    removeVisitedViews(
      shellTags.value
        .slice(1, idx)
        .map((t) => t.key)
        .filter((k) => k !== SHELL_SURFACE_WORKSPACE),
    );
  }

  function closeShellTagsRightOfAnchor(): void {
    const idx = shellTags.value.findIndex(
      (t) => t.key === activeShellTagKey.value,
    );
    if (idx < 0 || idx >= shellTags.value.length - 1) return;
    removeVisitedViews(
      shellTags.value
        .slice(idx + 1)
        .map((t) => t.key)
        .filter((k) => k !== SHELL_SURFACE_WORKSPACE),
    );
  }

  function closeOtherShellTags(): void {
    removeVisitedViews(
      visitedViewIds.value.filter((id) => id !== activeShellTagKey.value),
    );
  }
  async function closeAllShellTags(): Promise<void> {
    removeVisitedViews([...visitedViewIds.value]);
    await integration.openWorkspace();
  }

  async function refreshActiveShellSurface(): Promise<void> {
    const viewId = activeViewId.value;
    if (!viewId) return;
    if (embedded.embedReadyViewIds.value.has(viewId))
      embedded.embedReadyViewIds.value = new Set(
        [...embedded.embedReadyViewIds.value].filter((id) => id !== viewId),
      );
    ensureEmbedSurfaceLoading(viewId);
    if (usesIframeEmbed) {
      const iframe = getEmbedIframe(viewId);
      if (iframe?.src) {
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
        return;
      }
    }
    postShellEmbedReset(getEmbedIframe(viewId)?.contentWindow ?? null);
  }

  function onEmbedIframeLoad(viewId: string): void {
    requestAnimationFrame(() => void completeEmbedSurfaceLoading(viewId));
  }

  // ─── Auth session ──────────────────────────────────────
  function syncShellAuthSessionStorage(
    payload: ShellAuthSessionPayload | null,
  ): void {
    if (payload?.user?.trim()) {
      writeWebAuthSession(payload);
      return;
    }
    clearWebAuthSession();
  }

  async function logout(): Promise<void> {
    await shellHost.logout();
    opts.resetOrganizationSession();
    clearWebAuthSession();
    if (shellHost.shouldRefreshAuthSessionAfterLogout)
      await opts.refreshAuthSession();
  }

  // ─── IPC handlers ──────────────────────────────────────
  const onThemeChanged = (_e: unknown, p: { theme?: ThemeMode }): void => {
    if (p?.theme === 'light' || p?.theme === 'dark') {
      isThemeSwitching.value = true;
      theme.value = p.theme;
      setTimeout(() => {
        isThemeSwitching.value = false;
      }, 220);
    }
  };

  const onAuthSessionChanged = (
    _e: unknown,
    p: ShellAuthSessionPayload | null,
  ): void => {
    opts.setAuthSession(p);
    syncShellAuthSessionStorage(p);
    if (hasValidShellAuthSession(p))
      authWaiter.resolveShellAuthLoginWaiters(true);
  };

  const onAuthLoginDismissed = (): void => {
    if (!authWaiter.hasAuthenticatedShellSession())
      authWaiter.resolveShellAuthLoginWaiters(false);
  };

  // ─── Watchers ──────────────────────────────────────────
  watch(activeViewId, (viewId) => {
    if (viewId) embedded.loadedEmbedIds.value.add(viewId);
    rememberVisitedView(viewId);
    integration.persistCurrentShellSurface();
  });

  watch([showShellTagsBar, () => opts.layoutPreferences.collapsed], () => {
    requestAnimationFrame(() => reportShellViewport());
  });

  // ─── Embed src ─────────────────────────────────────────
  const embedSrc = computed(() => {
    const out = {} as Record<EmbeddedShellWindowId, string>;
    for (const id of embedded.embeddedViewIds) {
      if (shellHost.kind === 'electron') {
        const url = new URL(window.location.href);
        url.hash = '';
        url.searchParams.set('renderer', id);
        out[id] = url.href;
      } else {
        const base = import.meta.env.BASE_URL ?? '/';
        const nb = base.endsWith('/') ? base : `${base}/`;
        out[id] =
          `${nb}index.html?${WEB_SHELL_EMBED_QUERY}=${encodeURIComponent(id)}`;
      }
    }
    return out;
  });

  return {
    appMode,
    theme,
    availableViewIds,
    dormantIntegrableIds,
    activeViewId,
    selectedSidebarItem,
    activeViewPersistReady,
    sortableViewIds,
    isThemeSwitching,
    isSorting,
    preferencesOpen,
    integrationOpen: integration.integrationOpen,
    integrationClosable: integration.integrationClosable,
    addPickerOpen: integration.addPickerOpen,
    integrationGridViewIds: integration.integrationGridViewIds,
    embedSrc,
    loadedEmbedIds: embedded.loadedEmbedIds,
    embedReadyViewIds: embedded.embedReadyViewIds,
    embedLoadingViewId: embedded.embedLoadingViewId,
    shellTags,
    shellTagItems,
    activeShellTagKey,
    showShellTagsBar,
    visitedViewIds,
    shellBreadcrumbItems,
    authWaiter,
    loadShellState,
    applyTheme,
    applyAccentPreset,
    reportShellViewport,
    resolveShellViewLabel,
    getEmbedIframe,
    onEmbedIframeLoad,
    ensureEmbedSurfaceLoading,
    tryCompleteEmbedFromExistingFrame,
    openWorkspace: integration.openWorkspace,
    selectIntegratedApp: integration.selectIntegratedApp,
    enableIntegratedApp: integration.enableIntegratedApp,
    hideIntegratedApp: integration.hideIntegratedApp,
    openIntegrationLauncher: integration.openIntegrationLauncher,
    returnToIntegrationHome: integration.returnToIntegrationHome,
    closeIntegrationLauncher: integration.closeIntegrationLauncher,
    onSortEndReorder: integration.onSortEndReorder,
    activateShellTag,
    closeShellTag,
    closeShellTagsLeftOfAnchor,
    closeShellTagsRightOfAnchor,
    closeOtherShellTags,
    closeAllShellTags,
    refreshActiveShellSurface,
    logout,
    syncShellAuthSessionStorage,
    onThemeChanged,
    onAuthSessionChanged,
    onAuthLoginDismissed,
    shellTopPx,
    usesIframeEmbed,
    shellHost,
    sidebarLabels,
    standaloneSidebarAppIds,
    syncShellEmbeddedContentVisible: embedded.syncShellEmbeddedContentVisible,
  };
}
