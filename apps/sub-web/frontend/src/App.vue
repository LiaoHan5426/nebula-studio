<script setup lang="ts">
import {
  SHELL_SURFACE_WORKSPACE,
  WEB_SHELL_EMBED_QUERY,
  getEmbeddedShellWindowIds,
  getShellHostBridge,
  getShellIntegratedAppMeta,
  isShellEmbedResetAckPayload,
  isShellIntegrableAppId,
  persistShellSurfacePreference,
  postShellEmbedReset,
  readShellSurfacePreference,
  shellPresentationConfig,
} from '@nebula-studio/app-shell';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import {
  NebulaButton,
  NebulaDrag,
  NebulaThemeToggle,
} from '@nebula-studio/nebula-ui';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

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
const authSession = ref<{ user: string } | null>(null);
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
const isSidebarCollapsed = ref(false);
const showResizer = ref(false);
/** 已创建过的 iframe，懒加载 + v-show 保活，避免每次进入子应用整页重载 */
const loadedEmbedIds = ref<Set<string>>(new Set());
/** 已完成首次渲染的子应用，再次进入时不展示过渡层 */
const embedReadyViewIds = ref<Set<string>>(new Set());
const embedLoadingViewId = ref<string | null>(null);
const EMBED_SURFACE_MIN_LOADING_MS = 320;
const EMBED_SURFACE_LOAD_TIMEOUT_MS = 12000;
const embedLoadStartedAtByViewId = new Map<string, number>();
const embedLoadTimeoutByViewId = new Map<string, number>();
const embedHomeWaitByViewId = new Map<
  string,
  { resolve: () => void; timer: number }
>();
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

const authAvatarText = computed(() => {
  const raw = authSession.value?.user?.trim();
  if (!raw) return '?';
  return raw.slice(0, 1).toUpperCase();
});

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

const activeShellTagKey = computed(
  () => activeViewId.value ?? SHELL_SURFACE_WORKSPACE,
);

const showShellTagsBar = computed(() => !integrationOpen.value);

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

function refreshActiveShellSurface(): void {
  const viewId = activeViewId.value;
  if (!viewId) return;
  if (embedReadyViewIds.value.has(viewId)) {
    embedReadyViewIds.value = new Set(
      [...embedReadyViewIds.value].filter((id) => id !== viewId),
    );
  }
  ensureEmbedSurfaceLoading(viewId);
  if (usesIframeEmbed) {
    const iframe = getEmbedIframe(viewId);
    iframe?.contentWindow?.location.reload();
    return;
  }
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

function waitForEmbeddedViewHome(
  viewId: string,
  timeoutMs = 500,
): Promise<void> {
  return new Promise((resolve) => {
    const existing = embedHomeWaitByViewId.get(viewId);
    if (existing) {
      window.clearTimeout(existing.timer);
      embedHomeWaitByViewId.delete(viewId);
    }
    const timer = window.setTimeout(() => {
      embedHomeWaitByViewId.delete(viewId);
      resolve();
    }, timeoutMs);
    embedHomeWaitByViewId.set(viewId, {
      resolve: () => {
        window.clearTimeout(timer);
        embedHomeWaitByViewId.delete(viewId);
        resolve();
      },
      timer,
    });
    requestEmbeddedViewHome(viewId);
  });
}

function handleShellEmbedMessage(event: MessageEvent): void {
  if (!isShellEmbedResetAckPayload(event.data)) return;
  if (event.origin !== window.location.origin) return;
  for (const [viewId, wait] of embedHomeWaitByViewId) {
    if (getEmbedIframe(viewId)?.contentWindow === event.source) {
      wait.resolve();
      return;
    }
  }
}

function resetIntegrableEmbedOnLeave(viewId: string | null): void {
  if (!usesIframeEmbed) return;
  if (!viewId || !isShellIntegrableAppId(viewId)) return;
  requestEmbeddedViewHome(viewId);
}

function handleMouseMove(event: MouseEvent) {
  const sidebarWidth = isSidebarCollapsed.value ? 48 : 220;
  const resizerWidth = 20;
  showResizer.value =
    event.clientX >= sidebarWidth - resizerWidth &&
    event.clientX <= sidebarWidth + resizerWidth;
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
  appMode.value = nextMode === 'dev' ? 'dev' : 'build';
}

async function switchEmbeddedView(viewId: string): Promise<void> {
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
  isThemeSwitching.value = true;
  theme.value = await window.electron.ipcRenderer.invoke('settings:theme:set', {
    theme: nextTheme,
  });
  setTimeout(() => {
    isThemeSwitching.value = false;
  }, 220);
}

async function refreshAuthSession(): Promise<void> {
  try {
    authSession.value = await window.api.auth.getSession();
  } catch {
    authSession.value = null;
  }
}

async function openLogin(): Promise<void> {
  await window.api.shell.openLogin();
}

async function logout(): Promise<void> {
  await window.api.auth.logout();
  if (shellHost.shouldRefreshAuthSessionAfterLogout) {
    await refreshAuthSession();
  }
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
  payload: { user: string } | null,
): void => {
  authSession.value = payload;
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

watch([showShellTagsBar, isSidebarCollapsed], () => {
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
  for (const wait of embedHomeWaitByViewId.values()) {
    window.clearTimeout(wait.timer);
  }
  embedHomeWaitByViewId.clear();
  window.electron.ipcRenderer.removeListener(
    'settings:theme:changed',
    onThemeChanged,
  );
  if (shellHost.shouldSubscribeAuthSessionChannel) {
    window.electron.ipcRenderer.removeListener(
      'auth:session-changed',
      onAuthSessionChanged,
    );
  }
});
</script>

<template>
  <div
    class="shell"
    :class="{ 'theme-switching': isThemeSwitching }"
    :data-theme="theme"
    :style="{ '--shell-top': `${shellTopPx}px` }"
  >
    <header class="shell-bar">
      <div class="shell-bar-left">
        <div class="shell-brand-menu">
          <div class="shell-brand-group">
            <button
              type="button"
              class="shell-brand shell-brand-btn"
              title="返回应用集成"
              @click="returnToIntegrationHome"
            >
              Nebula Studio
            </button>
            <span class="shell-badge">Host Shell</span>
          </div>
        </div>

        <nav class="breadcrumb" aria-label="当前位置">
          <template
            v-for="(segment, index) in shellBreadcrumbTrail"
            :key="`${segment}-${index}`"
          >
            <span
              class="breadcrumb-item"
              :class="{
                'is-current': index === shellBreadcrumbTrail.length - 1,
              }"
            >
              {{ segment }}
            </span>
            <span
              v-if="index < shellBreadcrumbTrail.length - 1"
              class="breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>
          </template>
        </nav>
      </div>

      <div class="shell-bar-actions">
        <div class="shell-controls">
          <button type="button" class="shell-control-btn" title="搜索">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <NebulaThemeToggle
          class="shell-btn"
          :theme="theme"
          @update:theme="applyTheme"
        />
        <NebulaButton
          v-if="!authSession"
          class="shell-btn"
          variant="secondary"
          @click="openLogin"
        >
          登录
        </NebulaButton>
        <div v-if="authSession" class="auth-menu">
          <button type="button" class="auth-avatar" :title="authSession.user">
            {{ authAvatarText }}
          </button>
          <div class="auth-dropdown">
            <div class="auth-dropdown-header">
              <p class="auth-dropdown-title">账号信息</p>
              <p class="auth-dropdown-user">{{ authSession.user }}</p>
            </div>
            <div class="auth-dropdown-divider" />
            <div class="auth-dropdown-actions">
              <NebulaButton
                type="button"
                class="auth-dropdown-logout"
                variant="ghost"
                @click="logout"
              >
                退出登录
              </NebulaButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div
      class="shell-body"
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
      @mousemove="handleMouseMove"
      @mouseleave="showResizer = false"
    >
      <aside class="shell-sidebar">
        <div class="sidebar-group">
          <button
            type="button"
            class="sidebar-item"
            :class="{ active: selectedSidebarItem === 'workspace' }"
            @click="openWorkspace"
          >
            <span class="sidebar-item-icon">
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
            <span class="sidebar-item-label">工作台</span>
          </button>
          <button
            type="button"
            class="sidebar-item"
            :class="{ active: selectedSidebarItem === 'integration' }"
            @click="openIntegrationLauncher"
          >
            <span class="sidebar-item-icon">
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
            <span class="sidebar-item-label">应用集成</span>
          </button>
        </div>

        <div class="sidebar-footer">
          <button
            type="button"
            class="sidebar-item sidebar-item-settings"
            :disabled="!settingsAvailable"
            @click="selectIntegratedApp('settings')"
          >
            <span class="sidebar-item-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                ></path>
              </svg>
            </span>
            <span class="sidebar-item-label">设置</span>
          </button>
        </div>
      </aside>

      <div
        class="sidebar-resizer"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        :class="{ visible: showResizer }"
        :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <span class="resizer-icon">{{ isSidebarCollapsed ? '→' : '←' }}</span>
      </div>

      <main class="shell-main">
        <div v-if="showShellTagsBar" class="shell-tags-view">
          <div class="shell-tags-scroll" role="tablist" aria-label="已打开页面">
            <button
              v-for="tag in shellTags"
              :key="tag.key"
              type="button"
              role="tab"
              class="shell-tag"
              :class="{ 'is-active': tag.key === activeShellTagKey }"
              :aria-selected="tag.key === activeShellTagKey"
              @click="activateShellTag(tag.key)"
            >
              <svg
                v-if="tag.key === SHELL_SURFACE_WORKSPACE"
                class="shell-tag-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"
                />
              </svg>
              <span class="shell-tag-label">{{ tag.label }}</span>
            </button>
          </div>
          <div class="shell-tags-actions">
            <button
              type="button"
              class="shell-tags-action-btn"
              title="刷新当前页"
              :disabled="!activeViewId"
              @click="refreshActiveShellSurface"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path
                  d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              class="shell-tags-action-btn"
              title="内容区全屏"
              @click="toggleShellContentFullscreen"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <polyline points="21 15 21 21 15 21"></polyline>
                <polyline points="3 9 3 3 9 3"></polyline>
              </svg>
            </button>
          </div>
        </div>

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
                  v-model="sortableViewIds"
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
      </main>
    </div>
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

.shell-bar {
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--shell-top);
  padding: 0 16px;
  font:
    13px/1.4 system-ui,
    sans-serif;
  background: var(--bar-bg);
  border-bottom: 1px solid var(--bar-border);
  box-shadow: 0 6px 20px rgb(8 9 14 / 18%);
  -webkit-app-region: drag;
}

.shell-brand-menu {
  position: relative;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.shell-brand-menu::after {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 14px;
  content: '';
}

.shell-brand-group {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.shell-bar-left {
  display: flex;
  flex: 1;
  gap: 16px;
  align-items: center;
  min-width: 0;
  -webkit-app-region: no-drag;
}

.shell-bar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  -webkit-app-region: no-drag;
}

.breadcrumb {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.breadcrumb-item {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
}

.breadcrumb-item.is-current {
  font-weight: 500;
  color: var(--text-main);
}

.breadcrumb-separator {
  flex-shrink: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground) / 70%);
}

/* 控制按钮 */
.shell-controls {
  display: flex;
  gap: 2px;
}

.shell-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--text-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.shell-control-btn:hover {
  color: var(--text-main);
  background-color: hsl(var(--muted) / 30%);
}

.shell-control-btn svg {
  width: 16px;
  height: 16px;
}

.shell-left {
  display: none;
}

.shell-brand {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.2px;
  -webkit-app-region: drag;
}

.shell-brand-btn {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
  -webkit-app-region: no-drag;
}

.shell-brand-btn:hover {
  opacity: 0.9;
}

.shell-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.3;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 14%);
  border: 1px solid hsl(var(--primary) / 38%);
  border-radius: 999px;
  -webkit-app-region: drag;
}

.shell-desc {
  min-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  -webkit-app-region: drag;
}

.shell-center {
  display: flex;
  flex-shrink: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.mode-chip {
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  border-radius: 999px;
}

.mode-dev {
  color: hsl(var(--success));
  background: hsl(var(--success) / 20%);
  border: 1px solid hsl(var(--success) / 45%);
}

.mode-build {
  color: hsl(var(--warning));
  background: hsl(var(--warning) / 20%);
  border: 1px solid hsl(var(--warning) / 45%);
}

.mode-dot {
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 50%;
}

.shell-app-launcher-trigger {
  display: flex;
  flex-shrink: 1;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.current-app-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.current-app-label strong {
  font-weight: 600;
  color: var(--text-main);
}

.integration-open-btn {
  flex-shrink: 0;
}

/* integration-overlay and panel styling moved into the new layout section */

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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(0 0 0 0);
}

.shell-versions {
  display: none;
}

.shell-actions {
  display: none;
}

.shell-body {
  --shell-sidebar-expanded-width: 220px;
  --shell-sidebar-collapsed-width: 48px;
  --shell-sidebar-width: var(--shell-sidebar-expanded-width);
  --shell-sidebar-duration: 0.28s;
  --shell-sidebar-ease: cubic-bezier(0.4, 0, 0.2, 1);

  position: relative;
  display: flex;
  min-height: calc(100vh - var(--shell-top));
  overflow: hidden;
}

.shell-body.sidebar-collapsed {
  --shell-sidebar-width: var(--shell-sidebar-collapsed-width);
}

.shell-sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: space-between;
  width: var(--shell-sidebar-width);
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  background: hsl(var(--background-deep) / 96%);
  border-right: 1px solid hsl(var(--border) / 82%);
  transition:
    width var(--shell-sidebar-duration) var(--shell-sidebar-ease),
    padding var(--shell-sidebar-duration) var(--shell-sidebar-ease);
  will-change: width;
}

.shell-body.sidebar-collapsed .shell-sidebar {
  padding: 12px 0;
}

.shell-body.sidebar-collapsed .sidebar-item {
  padding: 0 14px;
}

.shell-body.sidebar-collapsed .sidebar-item-label {
  opacity: 0;
  transition-delay: 0s;
}

.sidebar-group,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 32%);
  border: 1px solid transparent;
  border-radius: 10px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    padding var(--shell-sidebar-duration) var(--shell-sidebar-ease);
}

.sidebar-item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.sidebar-item-icon svg {
  width: 100%;
  height: 100%;
}

.sidebar-item-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transition: opacity calc(var(--shell-sidebar-duration) * 0.6)
    var(--shell-sidebar-ease);
}

.shell-body:not(.sidebar-collapsed) .sidebar-item-label {
  transition-delay: 0.1s;
}

.sidebar-item:hover:not(:disabled) {
  background: hsl(var(--primary) / 12%);
}

.sidebar-item.active {
  background: hsl(var(--primary) / 16%);
  border-color: hsl(var(--primary) / 42%);
}

.sidebar-item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.sidebar-item-settings {
  margin-top: auto;
}

.sidebar-resizer {
  position: absolute;
  top: 0;
  left: 220px;
  z-index: 10;
  width: 4px;
  height: 100%;
  cursor: pointer;
  background-color: transparent;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease,
    left 0.3s ease;
}

.sidebar-resizer::before {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 40px;
  content: '';
  background: hsl(var(--background-deep) / 96%);
  border: 1px solid hsl(var(--border) / 82%);
  border-radius: 0 6px 6px 0;
  opacity: 0;
  transform: translateY(-50%);
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.sidebar-resizer::after {
  position: absolute;
  top: 50%;
  left: 0;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  content: '';
  border-bottom: 2px solid hsl(var(--foreground));
  border-left: 2px solid hsl(var(--foreground));
  opacity: 0;
  transform: translateY(-50%) rotate(45deg);
  transition:
    opacity 0.2s ease,
    transform 0.3s ease,
    border-color 0.2s ease;
}

.sidebar-resizer.visible {
  opacity: 1;
}

.sidebar-resizer.visible::before {
  opacity: 1;
}

.sidebar-resizer.visible::after {
  opacity: 1;
}

.sidebar-resizer:hover::before {
  background: hsl(var(--primary) / 16%);
  border-color: hsl(var(--primary) / 55%);
}

.sidebar-resizer:hover::after {
  border-color: hsl(var(--primary));
}

.sidebar-collapsed .sidebar-resizer {
  left: 48px;
}

.sidebar-collapsed .sidebar-resizer::before {
  left: 0;
  border-radius: 0 6px 6px 0;
}

.sidebar-collapsed .sidebar-resizer::after {
  left: 0;
  margin-left: 6px;
  transform: translateY(-50%) rotate(-135deg);
}

.shell-main {
  --shell-tags-height: 40px;

  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.shell-tags-view {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  height: var(--shell-tags-height);
  padding: 0 12px;
  background: hsl(var(--background-deep) / 88%);
  border-bottom: 1px solid hsl(var(--border) / 82%);
}

.shell-tags-scroll {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.shell-tags-scroll::-webkit-scrollbar {
  display: none;
}

.shell-tag {
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  background: transparent;
  border: 1px solid hsl(var(--border) / 90%);
  border-radius: 4px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.shell-tag:hover {
  color: var(--text-main);
  border-color: hsl(var(--primary) / 45%);
}

.shell-tag.is-active {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.shell-tag.is-active:hover {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary) / 92%);
  border-color: hsl(var(--primary) / 92%);
}

.shell-tag-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.shell-tag-label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shell-tags-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;
}

.shell-tags-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--text-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.shell-tags-action-btn:hover:not(:disabled) {
  color: var(--text-main);
  background-color: hsl(var(--muted) / 30%);
}

.shell-tags-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.shell-tags-action-btn svg {
  width: 15px;
  height: 15px;
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
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.shell-embed-frame {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
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
