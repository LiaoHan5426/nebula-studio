<script setup lang="ts">
import {
  SHELL_SURFACE_WORKSPACE,
  WEB_SHELL_EMBED_QUERY,
  clearWebAuthSession,
  embeddedViewRequiresShellAuth,
  getEmbeddedShellWindowIds,
  getShellHostBridge,
  getShellIntegratedAppMeta,
  hasValidShellAuthSession,
  isShellEmbedResetAckPayload,
  isShellIntegrableAppId,
  isShellIntegratableAppId,
  persistShellSurfacePreference,
  postShellEmbedReset,
  readShellSurfacePreference,
  readWebAuthSession,
  shellPresentationConfig,
  writeWebAuthSession,
} from '@nebula-studio/app-shell';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { NebulaButton, NebulaDrag } from '@nebula-studio/nebula-ui';
import {
  NebulaShellLayout,
  useLayoutPreferences,
  ACCENT_PRESETS,
} from '@nebula-studio/nebula-layout';
import type {
  BreadcrumbSegment,
  ShellTagItem,
} from '@nebula-studio/nebula-layout';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { useOrganization } from '@/shared/composables/useOrganization';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';
const shellTopPx = shellPresentationConfig.shell.topInsetPx;
/** Web / Electron 宿主差异见 `@nebula-studio/app-shell` 的 `getShellHostBridge()` */
const shellHost = getShellHostBridge();
const usesIframeEmbed = shellHost.usesIframeEmbed;

const embeddedViewIds = getEmbeddedShellWindowIds();

function buildEmbeddedSurfaceUrl(viewId: EmbeddedShellWindowId): string {
  if (shellHost.kind === 'electron') {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('renderer', viewId);
    return url.href;
  }
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const qs = `${WEB_SHELL_EMBED_QUERY}=${encodeURIComponent(viewId)}`;
  return `${normalizedBase}index.html?${qs}`;
}

const embedSrc = computed(() => {
  const out = {} as Record<EmbeddedShellWindowId, string>;
  for (const id of embeddedViewIds) {
    out[id] = buildEmbeddedSurfaceUrl(id);
  }
  return out;
});

const appMode = ref<AppMode>('build');
const theme = ref<ThemeMode>('dark');
const availableViewIds = ref<string[]>([]);
const dormantIntegrableIds = ref<string[]>([]);
const activeViewId = ref<string | null>(null);
const authSession = ref<{ user: string; token?: string } | null>(null);
const authLoginWaiters = new Set<(ok: boolean) => void>();
const SHELL_AUTH_WAIT_TIMEOUT_MS = 120_000;

function resolveShellAuthLoginWaiters(ok: boolean): void {
  for (const resolve of authLoginWaiters) {
    resolve(ok);
  }
  authLoginWaiters.clear();
}

function hasAuthenticatedShellSession(): boolean {
  return hasValidShellAuthSession(authSession.value ?? readWebAuthSession());
}

function waitForShellAuthSession(): Promise<boolean> {
  if (hasAuthenticatedShellSession()) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    authLoginWaiters.add(resolve);
    window.setTimeout(() => {
      if (!authLoginWaiters.delete(resolve)) return;
      resolve(hasAuthenticatedShellSession());
    }, SHELL_AUTH_WAIT_TIMEOUT_MS);
  });
}

async function ensureShellAuthForEmbeddedView(
  viewId: string,
): Promise<boolean> {
  if (shellHost.kind !== 'electron') return true;
  if (!embeddedViewRequiresShellAuth(viewId)) return true;
  await refreshAuthSession();
  if (hasAuthenticatedShellSession()) return true;
  await openLogin();
  return waitForShellAuthSession();
}
const {
  orgEnabled,
  orgOptions,
  currentOrgId,
  orgLoading,
  canSwitchOrg,
  loadOrganizationContext,
  switchOrganization,
  resetOrganizationSession,
} = useOrganization();
/** 默认不展开应用集成层；挂载后由 resolveInitialIntegrationOpen（仅看 active-view）决定 */
const integrationOpen = ref(false);
const integrationClosable = ref(false);
const addPickerOpen = ref(false);
const integrationPreferenceHydrated = ref(false);
type SidebarItemKey = 'workspace' | 'integration' | 'settings';

const sidebarItems: { key: SidebarItemKey; label: string }[] = [
  { key: 'workspace', label: '工作台' },
  { key: 'integration', label: '应用集成' },
];

const sidebarSectionLabels: Record<SidebarItemKey, string> = {
  workspace: '工作台',
  integration: '应用集成',
  settings: '设置',
};

const firstSidebarItem = sidebarItems[0]?.key || 'workspace';

const selectedSidebarItem = ref<SidebarItemKey>(firstSidebarItem);
/** 为 true 后才把 activeViewId 写入 localStorage，避免 loadShellState 的临时值覆盖用户刷新前要恢复的子应用 */
const activeViewPersistReady = ref(false);
const sortableViewIds = ref<string[]>([]);
const isSorting = ref(false);
const isThemeSwitching = ref(false);
const { preferences: layoutPreferences } = useLayoutPreferences();
const preferencesOpen = ref(false);

function applyAccentPreset(presetId: string): void {
  const preset = ACCENT_PRESETS.find((item) => item.id === presetId);
  if (preset) {
    document.documentElement.style.setProperty('--primary', preset.primary);
  }
}
/** 已创建过的 iframe，懒加载 + v-show 保活，避免每次进入子应用整页重载 */
const loadedEmbedIds = ref<Set<string>>(new Set());
/** 已完成首次渲染的子应用，再次进入时不展示过渡层 */
const embedReadyViewIds = ref<Set<string>>(new Set());
const embedLoadingViewId = ref<string | null>(null);
const EMBED_SURFACE_MIN_LOADING_MS = 320;
const EMBED_SURFACE_LOAD_TIMEOUT_MS = 12000;
const embedLoadStartedAtByViewId = new Map<string, number>();
const embedLoadTimeoutByViewId = new Map<string, number>();
let suppressTileClickUntilTs = 0;

function syncShellEmbeddedContentVisible(): void {
  if (usesIframeEmbed) return;
  window.electron.ipcRenderer.send('shell:embedded-content-visible', {
    visible: !integrationOpen.value,
  });
}

const settingsAvailable = computed(() =>
  availableViewIds.value.includes('settings'),
);

function resolveShellViewLabel(viewId: string): string {
  if (viewId === 'settings') return sidebarSectionLabels.settings;
  if (isShellIntegrableAppId(viewId)) {
    return getShellIntegratedAppMeta(viewId).label;
  }
  return viewId;
}

const shellBreadcrumbTrail = computed((): string[] => {
  if (integrationOpen.value) {
    return [sidebarSectionLabels.integration];
  }

  const viewId = activeViewId.value;
  if (viewId) {
    if (viewId === 'settings') {
      return [sidebarSectionLabels.settings];
    }
    if (isShellIntegrableAppId(viewId)) {
      return [
        sidebarSectionLabels.integration,
        getShellIntegratedAppMeta(viewId).label,
      ];
    }
    return [viewId];
  }

  const section = selectedSidebarItem.value;
  return [sidebarSectionLabels[section] ?? sidebarSectionLabels.workspace];
});

const shellBreadcrumbItems = computed((): BreadcrumbSegment[] => {
  const trail = shellBreadcrumbTrail.value;
  return trail.map((label, index) => {
    let icon: BreadcrumbSegment['icon'] = 'file';
    if (index === 0) {
      icon =
        label === sidebarSectionLabels.integration
          ? 'integration'
          : label === sidebarSectionLabels.settings
            ? 'settings'
            : 'home';
    } else if (label === sidebarSectionLabels.integration) {
      icon = 'integration';
    } else if (label === sidebarSectionLabels.settings) {
      icon = 'settings';
    }
    return { key: `${label}-${index}`, label, icon };
  });
});

/** 已访问子应用，用于标签栏（与顶部面包屑路径分离） */
const visitedViewIds = ref<string[]>([]);

const shellTags = computed(() => {
  const tags: Array<{ key: string; label: string }> = [
    { key: SHELL_SURFACE_WORKSPACE, label: sidebarSectionLabels.workspace },
  ];
  for (const viewId of visitedViewIds.value) {
    tags.push({ key: viewId, label: resolveShellViewLabel(viewId) });
  }
  return tags;
});

const shellTagItems = computed((): ShellTagItem[] =>
  shellTags.value.map((tag) => ({
    key: tag.key,
    label: tag.label,
    icon: tag.key === SHELL_SURFACE_WORKSPACE ? 'home' : undefined,
    closable: tag.key !== SHELL_SURFACE_WORKSPACE,
  })),
);

const activeShellTagKey = computed(
  () => activeViewId.value ?? SHELL_SURFACE_WORKSPACE,
);

function isShellTagClosable(key: string): boolean {
  return key !== SHELL_SURFACE_WORKSPACE;
}

function getActiveShellTagIndex(): number {
  const key = activeShellTagKey.value;
  return shellTags.value.findIndex((tag) => tag.key === key);
}

const showShellTagsBar = computed(() => !integrationOpen.value);

/** 应用集成网格：排除侧栏固定入口（如「设置」） */
const integrationGridViewIds = computed({
  get() {
    return sortableViewIds.value.filter((viewId) =>
      isShellIntegratableAppId(viewId),
    );
  },
  set(next) {
    const pinned = sortableViewIds.value.filter(
      (viewId) => !isShellIntegratableAppId(viewId),
    );
    sortableViewIds.value = [...pinned, ...next];
  },
});

const showEmbedSurfaceTransition = computed(
  () =>
    embedLoadingViewId.value !== null &&
    embedLoadingViewId.value === activeViewId.value,
);

const embedTransitionLabel = computed(() => {
  const viewId = embedLoadingViewId.value;
  return viewId ? resolveShellViewLabel(viewId) : '';
});

const embedTransitionIconSvg = computed(() => {
  const viewId = embedLoadingViewId.value;
  if (!viewId || !availableViewIds.value.includes(viewId)) return '';
  return getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId).iconSvg;
});

function isEmbedSurfaceReady(viewId: string): boolean {
  return (
    embedReadyViewIds.value.has(viewId) && embedLoadingViewId.value !== viewId
  );
}

function beginEmbedSurfaceLoading(viewId: string): void {
  const pending = embedLoadTimeoutByViewId.get(viewId);
  if (pending !== undefined) {
    window.clearTimeout(pending);
    embedLoadTimeoutByViewId.delete(viewId);
  }
  embedLoadStartedAtByViewId.set(viewId, Date.now());
  embedLoadingViewId.value = viewId;
  const timeout = window.setTimeout(() => {
    embedLoadTimeoutByViewId.delete(viewId);
    void completeEmbedSurfaceLoading(viewId);
  }, EMBED_SURFACE_LOAD_TIMEOUT_MS);
  embedLoadTimeoutByViewId.set(viewId, timeout);
}

async function completeEmbedSurfaceLoading(viewId: string): Promise<void> {
  const startedAt = embedLoadStartedAtByViewId.get(viewId) ?? Date.now();
  const remain = EMBED_SURFACE_MIN_LOADING_MS - (Date.now() - startedAt);
  if (remain > 0) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, remain);
    });
  }
  embedReadyViewIds.value = new Set([...embedReadyViewIds.value, viewId]);
  embedLoadStartedAtByViewId.delete(viewId);
  const pending = embedLoadTimeoutByViewId.get(viewId);
  if (pending !== undefined) {
    window.clearTimeout(pending);
    embedLoadTimeoutByViewId.delete(viewId);
  }
  if (embedLoadingViewId.value === viewId) {
    embedLoadingViewId.value = null;
  }
}

function ensureEmbedSurfaceLoading(viewId: string | null | undefined): void {
  if (!viewId || embedReadyViewIds.value.has(viewId)) return;
  beginEmbedSurfaceLoading(viewId);
  if (!usesIframeEmbed) {
    void completeEmbedSurfaceLoading(viewId);
  }
}

function tryCompleteEmbedFromExistingFrame(viewId: string): void {
  const iframe = getEmbedIframe(viewId);
  if (iframe?.contentDocument?.readyState === 'complete') {
    void completeEmbedSurfaceLoading(viewId);
  }
}

function onEmbedIframeLoad(viewId: string): void {
  requestAnimationFrame(() => {
    void completeEmbedSurfaceLoading(viewId);
  });
}

function clearEmbedSurfaceLoadingTimers(): void {
  for (const timer of embedLoadTimeoutByViewId.values()) {
    window.clearTimeout(timer);
  }
  embedLoadTimeoutByViewId.clear();
  embedLoadStartedAtByViewId.clear();
  embedLoadingViewId.value = null;
}

function rememberVisitedView(viewId: string | null): void {
  if (!viewId || visitedViewIds.value.includes(viewId)) return;
  visitedViewIds.value = [...visitedViewIds.value, viewId];
}

function activateShellTag(key: string): void {
  if (key === SHELL_SURFACE_WORKSPACE) {
    void openWorkspace();
    return;
  }
  void selectIntegratedApp(key);
}

function cleanupClosedShellTag(viewId: string): void {
  resetIntegrableEmbedOnLeave(viewId);
  if (loadedEmbedIds.value.has(viewId)) {
    loadedEmbedIds.value = new Set(
      [...loadedEmbedIds.value].filter((id) => id !== viewId),
    );
  }
  if (embedReadyViewIds.value.has(viewId)) {
    embedReadyViewIds.value = new Set(
      [...embedReadyViewIds.value].filter((id) => id !== viewId),
    );
  }
  const pending = embedLoadTimeoutByViewId.get(viewId);
  if (pending !== undefined) {
    window.clearTimeout(pending);
    embedLoadTimeoutByViewId.delete(viewId);
  }
  embedLoadStartedAtByViewId.delete(viewId);
  if (embedLoadingViewId.value === viewId) {
    embedLoadingViewId.value = null;
  }
}

function removeVisitedViews(viewIdsToRemove: string[]): void {
  if (viewIdsToRemove.length === 0) return;
  const removeSet = new Set(viewIdsToRemove);
  for (const viewId of viewIdsToRemove) {
    cleanupClosedShellTag(viewId);
  }
  visitedViewIds.value = visitedViewIds.value.filter(
    (viewId) => !removeSet.has(viewId),
  );
}

async function navigateAfterClosingActive(fallbackKey: string): Promise<void> {
  if (fallbackKey === SHELL_SURFACE_WORKSPACE) {
    await openWorkspace();
    return;
  }
  await selectIntegratedApp(fallbackKey);
}

async function closeShellTag(viewId: string): Promise<void> {
  if (!isShellTagClosable(viewId)) return;

  const closingIndex = shellTags.value.findIndex((tag) => tag.key === viewId);
  if (closingIndex < 0) return;

  const isActive = activeShellTagKey.value === viewId;
  removeVisitedViews([viewId]);

  if (!isActive) return;

  const remainingTags = shellTags.value;
  const fallbackIndex = Math.min(closingIndex - 1, remainingTags.length - 1);
  const fallbackKey =
    remainingTags[fallbackIndex]?.key ?? SHELL_SURFACE_WORKSPACE;
  await navigateAfterClosingActive(fallbackKey);
}

function closeShellTagsLeftOfAnchor(): void {
  const activeIdx = getActiveShellTagIndex();
  if (activeIdx <= 1) return;

  const toRemove = shellTags.value
    .slice(1, activeIdx)
    .map((tag) => tag.key)
    .filter(isShellTagClosable);
  removeVisitedViews(toRemove);
}

function closeShellTagsRightOfAnchor(): void {
  const activeIdx = getActiveShellTagIndex();
  const tags = shellTags.value;
  if (activeIdx < 0 || activeIdx >= tags.length - 1) return;

  const toRemove = tags
    .slice(activeIdx + 1)
    .map((tag) => tag.key)
    .filter(isShellTagClosable);
  removeVisitedViews(toRemove);
}

function closeOtherShellTags(): void {
  const activeKey = activeShellTagKey.value;
  const toRemove = visitedViewIds.value.filter(
    (viewId) => viewId !== activeKey,
  );
  removeVisitedViews(toRemove);
}

async function closeAllShellTags(): Promise<void> {
  removeVisitedViews([...visitedViewIds.value]);
  await openWorkspace();
}

async function refreshActiveShellSurface(): Promise<void> {
  const viewId = activeViewId.value;
  if (!viewId) return;
  if (embedReadyViewIds.value.has(viewId)) {
    embedReadyViewIds.value = new Set(
      [...embedReadyViewIds.value].filter((id) => id !== viewId),
    );
  }
  ensureEmbedSurfaceLoading(viewId);

  // For iframe mode, reload the iframe src directly for faster refresh
  if (usesIframeEmbed) {
    const iframe = getEmbedIframe(viewId);
    if (iframe?.src) {
      // Reload iframe by reassigning src
      const currentSrc = iframe.src;
      iframe.src = '';
      iframe.src = currentSrc;
      // Wait for iframe to load
      await new Promise<void>((resolve) => {
        const onLoad = () => {
          iframe.removeEventListener('load', onLoad);
          resolve();
        };
        iframe.addEventListener('load', onLoad);
        // Fallback timeout in case load event doesn't fire
        setTimeout(() => {
          iframe.removeEventListener('load', onLoad);
          resolve();
        }, 5000);
      });
      return;
    }
  }

  // For non-iframe mode, use postMessage reset
  requestEmbeddedViewHome(viewId);
}

function toggleShellContentFullscreen(): void {
  const host = document.querySelector<HTMLElement>('.shell-embed-host');
  if (!host) return;
  if (!document.fullscreenElement) {
    void host.requestFullscreen();
  } else {
    void document.exitFullscreen();
  }
}

function persistCurrentShellSurface(): void {
  if (!activeViewPersistReady.value) return;
  if (!shellHost.shouldPersistActiveViewPreference) return;

  if (integrationOpen.value && activeViewId.value) {
    persistShellSurfacePreference({
      kind: 'view',
      viewId: activeViewId.value,
    });
    return;
  }
  if (integrationOpen.value) {
    persistShellSurfacePreference({ kind: 'integration' });
    return;
  }
  if (activeViewId.value) {
    persistShellSurfacePreference({ kind: 'view', viewId: activeViewId.value });
    return;
  }
  persistShellSurfacePreference({ kind: 'workspace' });
}

function syncSidebarSelectionFromActiveView(viewId: string | null): void {
  if (!viewId) return;
  if (viewId === 'settings') {
    selectedSidebarItem.value = 'settings';
    return;
  }
  if (isShellIntegrableAppId(viewId)) {
    selectedSidebarItem.value = 'integration';
    return;
  }
  selectedSidebarItem.value = 'workspace';
}

const draggableItemKey = (item: unknown): string => String(item);

function markEmbedLoaded(viewId: string | null | undefined): void {
  if (!viewId || loadedEmbedIds.value.has(viewId)) return;
  loadedEmbedIds.value = new Set([...loadedEmbedIds.value, viewId]);
}

function getEmbedIframe(viewId: string): HTMLIFrameElement | null {
  return document.querySelector<HTMLIFrameElement>(
    `.shell-embed iframe[title="Nebula Studio — ${viewId}"]`,
  );
}

function requestEmbeddedViewHome(viewId: string): void {
  postShellEmbedReset(getEmbedIframe(viewId)?.contentWindow ?? null);
}

function handleShellEmbedMessage(_event: MessageEvent): void {
  // No longer used - iframe refresh now uses direct src reload
}

function resetIntegrableEmbedOnLeave(viewId: string | null): void {
  if (!usesIframeEmbed) return;
  if (!viewId || !isShellIntegrableAppId(viewId)) return;
  requestEmbeddedViewHome(viewId);
}

async function openWorkspace(): Promise<void> {
  embedLoadingViewId.value = null;
  const prevViewId = activeViewId.value;
  selectedSidebarItem.value = 'workspace';
  integrationClosable.value = true;
  addPickerOpen.value = false;
  integrationOpen.value = false;
  resetIntegrableEmbedOnLeave(prevViewId);
  activeViewId.value = null;
  commitIntegrationOpenNow(false);
  if (!usesIframeEmbed) {
    reportShellViewport();
    await window.electron.ipcRenderer.invoke(
      'shell:clear-active-embedded-view',
    );
  }
}

function commitIntegrationOpenNow(
  open: boolean,
  options?: { clearActiveViewOnOpen?: boolean },
): void {
  shellHost.commitIntegrationOpen(open, options);
}

/** 与主进程 BrowserView 同区域：取嵌入内容宿主，排除顶栏与标签栏占位 */
function reportShellViewport(): void {
  if (usesIframeEmbed) return;
  const host = document.querySelector<HTMLElement>('.shell-embed-host');
  const rect = host?.getBoundingClientRect();
  window.electron.ipcRenderer.send('shell-viewport', {
    x: rect?.left ?? 0,
    y: rect?.top ?? shellTopPx,
    width: rect?.width ?? window.innerWidth,
    height: rect?.height ?? Math.max(0, window.innerHeight - shellTopPx),
  });
}

async function loadShellState(): Promise<void> {
  const [state, nextTheme, nextMode] = await Promise.all([
    window.electron.ipcRenderer.invoke('shell:get-state'),
    window.electron.ipcRenderer.invoke('settings:theme:get'),
    window.electron.ipcRenderer.invoke('shell:app-mode:get'),
  ]);
  availableViewIds.value = Array.isArray(state?.availableViewIds)
    ? state.availableViewIds
    : [];
  sortableViewIds.value = [...availableViewIds.value];
  dormantIntegrableIds.value = Array.isArray(state?.dormantIntegrableIds)
    ? state.dormantIntegrableIds
    : [];
  activeViewId.value =
    typeof state?.activeViewId === 'string' ? state.activeViewId : null;
  theme.value = nextTheme === 'light' ? 'light' : 'dark';
  layoutPreferences.themeMode = theme.value;
  appMode.value = nextMode === 'dev' ? 'dev' : 'build';
  applyAccentPreset(layoutPreferences.accentPreset);
}

async function switchEmbeddedView(viewId: string): Promise<void> {
  if (!(await ensureShellAuthForEmbeddedView(viewId))) {
    return;
  }
  if (!usesIframeEmbed) {
    reportShellViewport();
  }
  const ok = await window.electron.ipcRenderer.invoke('shell:set-active-view', {
    viewId,
  });
  if (ok) {
    activeViewId.value = viewId;
    syncSidebarSelectionFromActiveView(viewId);
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

async function reorderEmbeddedViews(
  orderedViewIds: string[],
): Promise<boolean> {
  return Boolean(
    await window.electron.ipcRenderer.invoke('shell:reorder-embedded-views', {
      orderedViewIds,
    }),
  );
}

async function selectIntegratedApp(viewId: string): Promise<void> {
  if (Date.now() < suppressTileClickUntilTs) return;
  markEmbedLoaded(viewId);
  ensureEmbedSurfaceLoading(viewId);
  await switchEmbeddedView(viewId);
  await nextTick();
  tryCompleteEmbedFromExistingFrame(viewId);
  integrationOpen.value = false;
  integrationClosable.value = false;
  addPickerOpen.value = false;
}

async function enableIntegratedApp(viewId: string): Promise<void> {
  const ok = await enableEmbeddedView(viewId);
  if (ok) {
    await loadShellState();
    sortableViewIds.value = [...availableViewIds.value];
    addPickerOpen.value = false;
  }
}

async function hideIntegratedApp(viewId: string): Promise<void> {
  const ok = await disableEmbeddedView(viewId);
  if (!ok) return;
  await loadShellState();
  sortableViewIds.value = [...availableViewIds.value];
  // 默认不自动展开待启用列表，只在点击“添加应用”时展开。
  addPickerOpen.value = false;
}

function onSortStart(): void {
  isSorting.value = true;
}

async function onSortEnd(): Promise<void> {
  isSorting.value = false;
  addPickerOpen.value = false;
  // 避免拖拽松手后浏览器补发 click，误触进入子应用
  suppressTileClickUntilTs = Date.now() + 180;
  const orderedViewIds = [...sortableViewIds.value];
  if (orderedViewIds.join('|') === availableViewIds.value.join('|')) return;
  const ok = await reorderEmbeddedViews(orderedViewIds);
  if (ok) {
    availableViewIds.value = orderedViewIds;
  } else {
    await loadShellState();
  }
}

function openIntegrationLauncher(): void {
  selectedSidebarItem.value = 'integration';
  integrationClosable.value = false;
  addPickerOpen.value = false;
  integrationOpen.value = true;
  // 从侧边栏打开集成层，不应改变刷新恢复的子应用
  commitIntegrationOpenNow(true, { clearActiveViewOnOpen: false });
}

function returnToIntegrationHome(): void {
  integrationClosable.value = false;
  addPickerOpen.value = false;
  integrationOpen.value = true;
  // 移除 active-view，刷新后按「无记录 → 展开应用集成」
  commitIntegrationOpenNow(true, { clearActiveViewOnOpen: true });
}

function closeIntegrationLauncher(): void {
  if (!integrationClosable.value) return;
  integrationOpen.value = false;
  addPickerOpen.value = false;
  commitIntegrationOpenNow(false);
  if (!activeViewId.value) {
    selectedSidebarItem.value = 'workspace';
  }
}

async function applyTheme(nextTheme: ThemeMode): Promise<void> {
  layoutPreferences.themeMode = nextTheme;
  isThemeSwitching.value = true;
  theme.value = await window.electron.ipcRenderer.invoke('settings:theme:set', {
    theme: nextTheme,
  });
  setTimeout(() => {
    isThemeSwitching.value = false;
  }, 220);
}

function syncShellAuthSessionStorage(
  payload: { user: string; token?: string } | null,
): void {
  if (payload?.user?.trim()) {
    writeWebAuthSession({
      user: payload.user,
      token: payload.token,
    });
    return;
  }
  clearWebAuthSession();
}

async function refreshAuthSession(): Promise<void> {
  try {
    authSession.value = await window.api.auth.getSession();
    syncShellAuthSessionStorage(authSession.value);
  } catch {
    authSession.value = null;
    clearWebAuthSession();
  }
}

async function openLogin(): Promise<void> {
  await window.api.shell.openLogin();
}

async function logout(): Promise<void> {
  await window.api.auth.logout();
  resetOrganizationSession();
  clearWebAuthSession();
  if (shellHost.shouldRefreshAuthSessionAfterLogout) {
    await refreshAuthSession();
  }
}

async function onOrgChange(event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement;
  await switchOrganization(target.value);
}

const onThemeChanged = (
  _event: unknown,
  payload: { theme?: ThemeMode },
): void => {
  if (payload?.theme === 'light' || payload?.theme === 'dark') {
    isThemeSwitching.value = true;
    theme.value = payload.theme;
    setTimeout(() => {
      isThemeSwitching.value = false;
    }, 220);
  }
};

const onAuthSessionChanged = (
  _event: unknown,
  payload: { user: string; token?: string } | null,
): void => {
  authSession.value = payload;
  syncShellAuthSessionStorage(payload);
  if (hasValidShellAuthSession(payload)) {
    resolveShellAuthLoginWaiters(true);
  }
  if (payload) {
    void loadOrganizationContext();
  } else {
    resetOrganizationSession();
  }
};

const onAuthLoginDismissed = (): void => {
  if (!hasAuthenticatedShellSession()) {
    resolveShellAuthLoginWaiters(false);
  }
};

watch(integrationOpen, (open) => {
  if (open) {
    addPickerOpen.value = false;
  }
  if (integrationPreferenceHydrated.value) {
    shellHost.persistIntegrationOpenFromWatch(open);
  }
  syncShellEmbeddedContentVisible();
  persistCurrentShellSurface();
});

watch(activeViewId, (viewId) => {
  markEmbedLoaded(viewId);
  rememberVisitedView(viewId);
  persistCurrentShellSurface();
});

watch([showShellTagsBar, () => layoutPreferences.collapsed], () => {
  requestAnimationFrame(() => reportShellViewport());
});

onMounted(async () => {
  shellHost.onBeforeShellHydrate();
  await loadShellState();
  const preferredSurface = shellHost.shouldRestoreActiveViewFromPreference
    ? readShellSurfacePreference()
    : null;

  if (
    preferredSurface?.kind === 'view' &&
    availableViewIds.value.includes(preferredSurface.viewId) &&
    preferredSurface.viewId !== activeViewId.value
  ) {
    await switchEmbeddedView(preferredSurface.viewId);
    ensureEmbedSurfaceLoading(preferredSurface.viewId);
  }

  addPickerOpen.value = false;

  integrationOpen.value = shellHost.resolveInitialIntegrationOpen(
    activeViewId.value,
  );
  integrationPreferenceHydrated.value = true;
  activeViewPersistReady.value = true;
  shellHost.finalizeActiveViewOnMount({
    integrationOpen: integrationOpen.value,
    activeViewId: activeViewId.value,
  });
  /** 须在算出 integrationOpen 之后再同步一次（勿对 watch 使用 immediate：否则会先于 loadShellState 把嵌入区设为可见，破坏了主进程「集成层打开」状态）。 */
  syncShellEmbeddedContentVisible();
  if (integrationOpen.value) {
    selectedSidebarItem.value = 'integration';
  } else if (!activeViewId.value) {
    selectedSidebarItem.value = 'workspace';
  } else {
    syncSidebarSelectionFromActiveView(activeViewId.value);
    markEmbedLoaded(activeViewId.value);
    rememberVisitedView(activeViewId.value);
    ensureEmbedSurfaceLoading(activeViewId.value);
    await nextTick();
    if (activeViewId.value) {
      tryCompleteEmbedFromExistingFrame(activeViewId.value);
    }
  }
  await refreshAuthSession();
  if (
    shellHost.kind === 'electron' &&
    activeViewId.value &&
    embeddedViewRequiresShellAuth(activeViewId.value) &&
    !hasAuthenticatedShellSession()
  ) {
    await ensureShellAuthForEmbeddedView(activeViewId.value);
  }
  await loadOrganizationContext();
  reportShellViewport();
  if (!usesIframeEmbed) {
    window.addEventListener('resize', reportShellViewport);
  }
  window.addEventListener('message', handleShellEmbedMessage);
  window.electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  if (shellHost.shouldSubscribeAuthSessionChannel) {
    window.electron.ipcRenderer.on(
      'auth:session-changed',
      onAuthSessionChanged,
    );
    window.electron.ipcRenderer.on(
      'auth:login-dismissed',
      onAuthLoginDismissed,
    );
  }
  requestAnimationFrame(() => reportShellViewport());
});

onUnmounted(() => {
  shellHost.onShellUnmount();
  clearEmbedSurfaceLoadingTimers();
  if (!usesIframeEmbed) {
    window.removeEventListener('resize', reportShellViewport);
  }
  window.removeEventListener('message', handleShellEmbedMessage);
  window.electron.ipcRenderer.removeListener(
    'settings:theme:changed',
    onThemeChanged,
  );
  if (shellHost.shouldSubscribeAuthSessionChannel) {
    window.electron.ipcRenderer.removeListener(
      'auth:session-changed',
      onAuthSessionChanged,
    );
    window.electron.ipcRenderer.removeListener(
      'auth:login-dismissed',
      onAuthLoginDismissed,
    );
  }
});
</script>

<template>
  <div
    class="shell"
    :class="{ 'theme-switching': isThemeSwitching }"
    :data-theme="theme"
  >
    <NebulaShellLayout
      v-model:preferences-open="preferencesOpen"
      :breadcrumbs="shellBreadcrumbItems"
      :show-tags-bar="showShellTagsBar"
      :tags="shellTagItems"
      :active-tag-key="activeShellTagKey"
      :theme="theme"
      :auth-user="authSession?.user"
      :show-auth="true"
      @update:theme="applyTheme"
      @login="openLogin"
      @logout="logout"
      @tag-activate="activateShellTag"
      @tag-close="closeShellTag"
      @tags-close-left="closeShellTagsLeftOfAnchor"
      @tags-close-right="closeShellTagsRightOfAnchor"
      @tags-close-others="closeOtherShellTags"
      @tags-close-all="closeAllShellTags"
      @tags-refresh="refreshActiveShellSurface"
      @tags-fullscreen="toggleShellContentFullscreen"
      @refresh="refreshActiveShellSurface"
    >
      <template #sidebar-brand>
        <button
          type="button"
          class="nebula-layout-sidebar-brand nebula-layout-sidebar-brand--btn"
          title="返回应用集成"
          @click="returnToIntegrationHome"
        >
          <div class="nebula-layout-sidebar-brand__logo">N</div>
          <div class="nebula-layout-sidebar-brand__text">
            <div class="nebula-layout-sidebar-brand__title">Nebula Studio</div>
            <span class="nebula-layout-sidebar-brand__badge">Host Shell</span>
          </div>
        </button>
      </template>

      <template #sidebar>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': selectedSidebarItem === 'workspace' }"
          @click="openWorkspace"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">工作台</span>
        </button>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': selectedSidebarItem === 'integration' }"
          @click="openIntegrationLauncher"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">应用集成</span>
        </button>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': activeViewId === 'settings' }"
          :disabled="!settingsAvailable"
          @click="selectIntegratedApp('settings')"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              />
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">设置</span>
        </button>
      </template>

      <template #header-actions>
        <div v-if="orgEnabled && orgOptions.length > 0" class="org-switcher">
          <label class="org-switcher__label" for="shell-org-select">组织</label>
          <select
            id="shell-org-select"
            class="org-switcher__select"
            :value="currentOrgId"
            :disabled="orgLoading || !canSwitchOrg"
            @change="onOrgChange"
          >
            <option v-for="org in orgOptions" :key="org.id" :value="org.id">
              {{ org.orgName }}
            </option>
          </select>
        </div>
      </template>

      <div class="shell-main">
        <div class="shell-embed-host">
          <div v-if="usesIframeEmbed" class="shell-embed">
            <template v-for="viewId in availableViewIds" :key="viewId">
              <iframe
                v-if="loadedEmbedIds.has(viewId)"
                v-show="viewId === activeViewId"
                class="shell-embed-frame"
                :class="{ 'is-surface-ready': isEmbedSurfaceReady(viewId) }"
                :src="embedSrc[viewId as EmbeddedShellWindowId]"
                :title="`Nebula Studio — ${viewId}`"
                @load="onEmbedIframeLoad(viewId)"
              />
            </template>
          </div>

          <Transition name="shell-embed-transition">
            <div
              v-if="showEmbedSurfaceTransition"
              class="shell-embed-transition"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div class="shell-embed-transition-card">
                <div
                  v-if="embedTransitionIconSvg"
                  class="shell-embed-transition-icon"
                  v-html="embedTransitionIconSvg"
                />
                <div
                  class="shell-embed-transition-spinner"
                  aria-hidden="true"
                />
                <p class="shell-embed-transition-title">
                  正在打开 {{ embedTransitionLabel }}
                </p>
                <p class="shell-embed-transition-hint">加载应用界面…</p>
              </div>
            </div>
          </Transition>

          <div v-if="!activeViewId && !integrationOpen" class="workspace-empty">
            <div class="workspace-empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3 class="workspace-empty-title">暂无内容</h3>
            <p class="workspace-empty-desc">
              请从左侧导航或应用集成中选择一个应用
            </p>
          </div>
        </div>

        <div
          v-if="integrationOpen"
          class="integration-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="integration-dialog-title"
        >
          <button
            type="button"
            class="integration-backdrop"
            aria-label="关闭应用集成"
            @click="
              integrationClosable ? closeIntegrationLauncher() : undefined
            "
          />
          <div class="integration-panel">
            <div class="integration-panel-head">
              <h2 id="integration-dialog-title" class="integration-title">
                应用集成
              </h2>
              <NebulaButton
                v-if="integrationClosable"
                variant="ghost"
                @click="closeIntegrationLauncher"
              >
                关闭
              </NebulaButton>
            </div>
            <p class="integration-desc">
              点击图标可进入子应用；右上角可隐藏已添加应用；使用加号可重新启用。
            </p>
            <div class="integration-panel-body">
              <div class="integration-grid">
                <NebulaDrag
                  v-model="integrationGridViewIds"
                  class="integration-grid-apps"
                  :item-key="draggableItemKey"
                  handle=".integration-tile-icon"
                  ghost-class="integration-tile-ghost"
                  chosen-class="integration-tile-chosen"
                  drag-class="integration-tile-drag"
                  :animation="180"
                  @start="onSortStart"
                  @end="onSortEnd"
                >
                  <template #item="{ element: viewId }">
                    <div
                      role="button"
                      tabindex="0"
                      class="integration-tile"
                      :class="{
                        sorting: isSorting,
                      }"
                      @click="selectIntegratedApp(viewId)"
                      @keydown.enter.prevent="selectIntegratedApp(viewId)"
                      @keydown.space.prevent="selectIntegratedApp(viewId)"
                    >
                      <button
                        type="button"
                        class="integration-tile-hide"
                        title="隐藏应用"
                        aria-label="隐藏应用"
                        @click.stop="hideIntegratedApp(viewId)"
                      >
                        ×
                      </button>
                      <span
                        class="integration-tile-icon"
                        aria-hidden="true"
                        v-html="
                          getShellIntegratedAppMeta(
                            viewId as EmbeddedShellWindowId,
                          ).iconSvg
                        "
                      />
                      <span class="integration-tile-label">{{
                        getShellIntegratedAppMeta(
                          viewId as EmbeddedShellWindowId,
                        ).label
                      }}</span>
                    </div>
                  </template>
                </NebulaDrag>
                <button
                  v-if="dormantIntegrableIds.length > 0"
                  type="button"
                  class="integration-tile integration-tile-add"
                  :class="{ 'is-open': addPickerOpen }"
                  :aria-expanded="addPickerOpen"
                  aria-controls="integration-add-list"
                  @click="addPickerOpen = !addPickerOpen"
                >
                  <span class="integration-plus" aria-hidden="true">+</span>
                  <span class="integration-tile-label">添加应用</span>
                </button>
              </div>

              <div
                v-show="addPickerOpen && dormantIntegrableIds.length > 0"
                id="integration-add-list"
                class="integration-add-panel"
              >
                <p class="integration-add-heading">待启用的应用</p>
                <ul class="integration-add-list">
                  <li
                    v-for="viewId in dormantIntegrableIds"
                    :key="viewId"
                    class="integration-add-li"
                  >
                    <button
                      type="button"
                      class="integration-add-btn"
                      @click="enableIntegratedApp(viewId)"
                    >
                      <span
                        class="integration-tile-icon sm"
                        aria-hidden="true"
                        v-html="
                          getShellIntegratedAppMeta(
                            viewId as EmbeddedShellWindowId,
                          ).iconSvg
                        "
                      />
                      <span>{{
                        getShellIntegratedAppMeta(
                          viewId as EmbeddedShellWindowId,
                        ).label
                      }}</span>
                      <span class="integration-add-hint">启用</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NebulaShellLayout>
  </div>
</template>

<style lang="scss" scoped>
.shell {
  --shell-bg: radial-gradient(
    circle at top left,
    hsl(var(--background-deep)) 0%,
    hsl(var(--background)) 56%
  );
  --bar-bg: linear-gradient(
    180deg,
    hsl(var(--sidebar-deep) / 95%) 0%,
    hsl(var(--sidebar) / 95%) 100%
  );
  --bar-border: hsl(var(--border));
  --text-main: hsl(var(--foreground));
  --text-muted: hsl(var(--muted-foreground));
  --btn-bg: linear-gradient(
    180deg,
    hsl(var(--primary) / 92%) 0%,
    hsl(var(--primary) / 78%) 100%
  );
  --btn-border: hsl(var(--primary) / 60%);
  --btn-bg-hover: linear-gradient(
    180deg,
    hsl(var(--primary) / 100%) 0%,
    hsl(var(--primary) / 88%) 100%
  );
  --chip-bg: hsl(var(--muted) / 55%);

  position: relative;
  min-height: 100vh;
  margin: 0;
  background: var(--shell-bg);
}

.shell[data-theme='light'] {
  --shell-bg: radial-gradient(
    circle at top left,
    hsl(var(--background-deep)) 0%,
    hsl(var(--background)) 58%
  );
  --bar-bg: linear-gradient(
    180deg,
    hsl(var(--card) / 95%) 0%,
    hsl(var(--background-deep) / 92%) 100%
  );
  --chip-bg: hsl(var(--muted) / 80%);
}

.org-switcher {
  display: flex;
  gap: 6px;
  align-items: center;
}

.org-switcher__label {
  font-size: 12px;
  color: var(--text-muted);
}

.org-switcher__select {
  min-width: 140px;
  max-width: 220px;
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  color: var(--text-main);
  background: hsl(var(--background) / 80%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 6px;
}

.shell-main {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.shell-embed-host {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.workspace-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--shell-top) - 60px);
  padding: 2rem;
  text-align: center;
}

.workspace-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: hsl(var(--muted-foreground));
}

.workspace-empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.workspace-empty-desc {
  margin: 0;
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
}

.shell-embed {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.shell-embed-frame {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  pointer-events: none;
  background: hsl(var(--background));
  border: 0;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.shell-embed-frame.is-surface-ready {
  pointer-events: auto;
  opacity: 1;
}

.shell-embed-transition {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background-deep) / 94%);
  backdrop-filter: blur(6px);
}

.shell-embed-transition-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  min-width: 220px;
  padding: 28px 32px;
  text-align: center;
  background: hsl(var(--card) / 88%);
  border: 1px solid hsl(var(--border) / 78%);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgb(2 4 12 / 22%);
}

.shell-embed-transition-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: hsl(var(--primary));
}

.shell-embed-transition-icon :deep(svg) {
  width: 44px;
  height: 44px;
}

.shell-embed-transition-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid hsl(var(--border) / 70%);
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: shell-embed-spin 0.75s linear infinite;
}

.shell-embed-transition-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.shell-embed-transition-hint {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.shell-embed-transition-enter-active,
.shell-embed-transition-leave-active {
  transition: opacity 0.2s ease;
}

.shell-embed-transition-enter-from,
.shell-embed-transition-leave-to {
  opacity: 0;
}

@keyframes shell-embed-spin {
  to {
    transform: rotate(360deg);
  }
}

.integration-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: stretch;
  justify-content: center;
  pointer-events: auto;
}

.integration-panel {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  max-height: 100%;
  padding: 22px 24px 24px;
  overflow: hidden;
  background: hsl(var(--background) / 96%);
}

.integration-backdrop {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: rgb(8 10 18 / 52%);
  border: 0;
  backdrop-filter: blur(2px);
}

.integration-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.integration-panel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.integration-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.2px;
}

.integration-desc {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 220px));
  gap: 16px;
  justify-content: flex-start;
  margin-top: 18px;
}

.integration-grid-apps {
  display: contents;
}

.integration-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 132px;
  padding: 16px 12px;
  color: var(--text-main);
  cursor: pointer;
  user-select: none;
  background: hsl(var(--muted) / 38%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 14px;
  transition:
    transform 0.18s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.shell.theme-switching .integration-tile {
  transition: none !important;
}

.integration-tile.sorting {
  cursor: grab;
}

.integration-tile-hide {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  background: hsl(var(--background) / 35%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 999px;
}

.integration-tile-hide:hover {
  color: hsl(var(--danger));
  background: hsl(var(--danger) / 10%);
  border-color: hsl(var(--danger) / 35%);
}

.integration-tile:hover {
  background: hsl(var(--primary) / 10%);
  border-color: hsl(var(--primary) / 42%);
}

.integration-tile.dragging {
  opacity: 0.88;
}

.integration-tile-ghost {
  background: hsl(var(--primary) / 8%);
  border-color: hsl(var(--primary) / 62%);
  border-style: dashed;
  box-shadow: inset 0 0 0 2px hsl(var(--primary) / 24%);
}

.integration-tile-ghost .integration-tile-hide,
.integration-tile-ghost .integration-tile-icon,
.integration-tile-ghost .integration-tile-label {
  opacity: 0.05;
}

.integration-tile-chosen {
  border-color: hsl(var(--primary) / 55%);
  box-shadow: 0 10px 24px hsl(var(--primary) / 16%);
}

.integration-tile-drag {
  opacity: 0.95;
}

.integration-tile-label {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.integration-tile-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: var(--text-main);
}

.integration-tile-icon.sm {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

.integration-tile-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.integration-tile-add {
  border-style: dashed;
}

.integration-tile-add.is-open {
  border-color: hsl(var(--primary) / 45%);
  border-style: solid;
}

.integration-tile-muted {
  pointer-events: none;
  cursor: default;
  opacity: 0.52;
}

.integration-plus {
  font-size: 34px;
  font-weight: 200;
  line-height: 1;
  color: var(--text-muted);
}

.integration-add-panel {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid hsl(var(--border) / 65%);
}

.integration-add-heading {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.integration-add-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.integration-add-li {
  margin: 0;
}

.integration-add-btn {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 30%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 12px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.integration-add-btn:hover {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary) / 40%);
}

.integration-add-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.shell-btn {
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.auth-menu {
  --auth-pop-bg: hsl(var(--card) / 98%);
  --auth-pop-border: hsl(var(--border) / 82%);
  --auth-pop-divider: hsl(var(--border) / 62%);
  --auth-pop-title: hsl(var(--muted-foreground));
  --auth-pop-text: hsl(var(--foreground));

  position: relative;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.auth-menu::after {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  height: 10px;
  content: '';
}

.auth-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted) / 52%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 999px;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.auth-menu:hover .auth-avatar {
  background: hsl(var(--primary) / 18%);
  border-color: hsl(var(--primary) / 45%);
  transform: translateY(-1px);
}

.auth-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 12;
  min-width: 206px;
  padding: 12px;
  margin-top: 6px;
  pointer-events: none;
  background: var(--auth-pop-bg);
  border: 1px solid var(--auth-pop-border);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgb(2 4 12 / 26%);
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.auth-menu:hover .auth-dropdown {
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
}

.auth-dropdown-title {
  margin: 0;
  font-size: 12px;
  color: var(--auth-pop-title);
  letter-spacing: 0.2px;
}

.auth-dropdown-user {
  margin: 6px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 700;
  color: var(--auth-pop-text);
  white-space: nowrap;
}

.auth-dropdown-divider {
  height: 1px;
  margin: 10px 0;
  background: var(--auth-pop-divider);
}

.auth-dropdown-actions {
  display: flex;
}

.auth-dropdown-logout {
  justify-content: center;
  width: 100%;
}

@media (width <= 1200px) {
  .shell-desc {
    display: none;
  }
}

@media (width <= 960px) {
  .shell-bar {
    z-index: 30;
    padding: 0 12px;
  }

  .shell-body {
    display: block;
  }

  .sidebar-resizer {
    display: none;
  }

  .shell-sidebar {
    position: fixed;
    top: calc(var(--shell-top) - 2px);
    left: 12px;
    z-index: 29;
    visibility: hidden;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: min(220px, calc(100vw - 24px));
    max-height: calc(100vh - var(--shell-top) - 16px);
    padding: 14px 10px 10px;
    overflow: auto;
    pointer-events: none;
    background: hsl(var(--card) / 98%);
    border: 1px solid hsl(var(--border) / 82%);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgb(2 4 12 / 26%);
    opacity: 0;
    transform: translateY(-6px);
    transition:
      visibility 0.15s ease,
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .shell:has(.shell-brand-menu:hover) .shell-sidebar,
  .shell:has(.shell-sidebar:hover) .shell-sidebar {
    visibility: visible;
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0);
  }

  .shell-brand-menu::after {
    height: 28px;
  }

  .sidebar-group,
  .sidebar-footer {
    flex-direction: column;
    gap: 6px;
  }

  .sidebar-footer {
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid hsl(var(--border) / 62%);
  }

  .sidebar-item {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 10px;
  }

  .sidebar-item.active {
    color: var(--text-main);
    background: hsl(var(--primary) / 16%);
    border-color: hsl(var(--primary) / 42%);
  }

  .sidebar-item-icon {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }

  .sidebar-item-label {
    display: inline;
  }

  .shell-body.sidebar-collapsed .shell-sidebar {
    padding: 10px;
  }

  .shell-body.sidebar-collapsed .sidebar-item {
    justify-content: flex-start;
    padding: 10px 12px;
  }

  .shell-body.sidebar-collapsed .sidebar-item-label {
    width: auto;
    margin: 0;
    opacity: 1;
  }

  .shell-body.sidebar-collapsed .sidebar-item-icon {
    margin-right: 10px;
  }

  .shell-main {
    height: calc(100vh - var(--shell-top));
  }

  .auth-dropdown {
    right: -4px;
  }
}
</style>
