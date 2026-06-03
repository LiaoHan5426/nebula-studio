<script setup lang="ts">
import {
  WEB_SHELL_EMBED_QUERY,
  getEmbeddedShellWindowIds,
  getShellHostBridge,
  getShellIntegratedAppMeta,
  persistActiveViewPreference,
  readActiveViewPreference,
  shellPresentationConfig,
} from '@nebula-studio/app-shell';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import {
  NebulaButton,
  NebulaDrag,
  NebulaThemeToggle,
} from '@nebula-studio/nebula-ui';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';
const shellTopPx = shellPresentationConfig.shell.topInsetPx;
/** Web / Electron 宿主差异见 `@nebula-studio/app-shell` 的 `getShellHostBridge()` */
const shellHost = getShellHostBridge();
const usesIframeEmbed = shellHost.usesIframeEmbed;

const embeddedViewIds = getEmbeddedShellWindowIds();

const embedSrc = computed(() => {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const out = {} as Record<EmbeddedShellWindowId, string>;
  for (const id of embeddedViewIds) {
    const qs = `${WEB_SHELL_EMBED_QUERY}=${encodeURIComponent(id)}`;
    out[id] = `${normalizedBase}index.html?${qs}`;
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
const selectedSidebarItem = ref<'workspace' | 'integration' | 'settings'>(
  'workspace',
);
/** 为 true 后才把 activeViewId 写入 localStorage，避免 loadShellState 的临时值覆盖用户刷新前要恢复的子应用 */
const activeViewPersistReady = ref(false);
const sortableViewIds = ref<string[]>([]);
const isSorting = ref(false);
const isThemeSwitching = ref(false);
let suppressTileClickUntilTs = 0;

const settingsAvailable = computed(() =>
  availableViewIds.value.includes('settings'),
);

const authAvatarText = computed(() => {
  const raw = authSession.value?.user?.trim();
  if (!raw) return '?';
  return raw.slice(0, 1).toUpperCase();
});

const draggableItemKey = (item: unknown): string => String(item);

function openWorkspace(): void {
  selectedSidebarItem.value = 'workspace';
  integrationClosable.value = true;
  addPickerOpen.value = false;
  integrationOpen.value = false;
  commitIntegrationOpenNow(false);
}

function commitIntegrationOpenNow(
  open: boolean,
  options?: { clearActiveViewOnOpen?: boolean },
): void {
  shellHost.commitIntegrationOpen(open, options);
}

/** 与主进程 BrowserView 同宽：右侧停靠 DevTools 时 innerWidth 已不含 DevTools，避免与 getContentBounds 重复扣宽 */
function reportShellViewport(): void {
  window.electron.ipcRenderer.send('shell-viewport', {
    width: window.innerWidth,
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
  const ok = await window.electron.ipcRenderer.invoke('shell:set-active-view', {
    viewId,
  });
  if (ok) {
    activeViewId.value = viewId;
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
  await switchEmbeddedView(viewId);
  if (viewId === 'settings') {
    selectedSidebarItem.value = 'settings';
  }
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
  integrationClosable.value = true;
  addPickerOpen.value = false;
  integrationOpen.value = true;
  // 从顶部按钮临时打开集成层，不应改变刷新恢复的子应用
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
  shellHost.onIntegrationOpenChanged(open);
});

watch(activeViewId, (viewId) => {
  if (!activeViewPersistReady.value) return;
  if (!shellHost.shouldPersistActiveViewPreference) return;
  persistActiveViewPreference(typeof viewId === 'string' ? viewId : null);
});

onMounted(async () => {
  shellHost.onBeforeShellHydrate();
  await loadShellState();
  const preferredViewId = shellHost.shouldRestoreActiveViewFromPreference
    ? readActiveViewPreference()
    : null;

  if (
    preferredViewId &&
    availableViewIds.value.includes(preferredViewId) &&
    preferredViewId !== activeViewId.value
  ) {
    await switchEmbeddedView(preferredViewId);
  }

  addPickerOpen.value = false;

  integrationOpen.value = shellHost.resolveInitialIntegrationOpen(
    activeViewId.value,
  );
  // 已清空 active-view 但主进程/Web 模拟仍可能带回默认子应用 id，避免 iframe 与集成层语义不一致
  if (integrationOpen.value && !readActiveViewPreference()) {
    activeViewId.value = null;
  }
  integrationPreferenceHydrated.value = true;
  activeViewPersistReady.value = true;
  shellHost.finalizeActiveViewOnMount({
    integrationOpen: integrationOpen.value,
    activeViewId: activeViewId.value,
  });
  /** 须在算出 integrationOpen 之后再同步一次（勿对 watch 使用 immediate：否则会先于 loadShellState 把嵌入区设为可见，破坏了主进程「集成层打开」状态）。 */
  shellHost.onIntegrationOpenChanged(integrationOpen.value);
  await refreshAuthSession();
  reportShellViewport();
  window.addEventListener('resize', reportShellViewport);
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
  window.removeEventListener('resize', reportShellViewport);
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

      <div class="shell-bar-actions">
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

    <div class="shell-body">
      <aside class="shell-sidebar">
        <div class="sidebar-group">
          <button
            type="button"
            class="sidebar-item"
            :class="{ active: selectedSidebarItem === 'workspace' }"
            @click="openWorkspace"
          >
            工作台
          </button>
          <button
            type="button"
            class="sidebar-item"
            :class="{ active: selectedSidebarItem === 'integration' }"
            @click="openIntegrationLauncher"
          >
            应用集成
          </button>
        </div>

        <div class="sidebar-footer">
          <button
            type="button"
            class="sidebar-item sidebar-item-settings"
            :disabled="!settingsAvailable"
            @click="selectIntegratedApp('settings')"
          >
            设置
          </button>
        </div>
      </aside>

      <main class="shell-main">
        <div v-if="usesIframeEmbed" class="shell-embed">
          <iframe
            v-for="viewId in availableViewIds"
            v-show="viewId === activeViewId"
            :key="viewId"
            class="shell-embed-frame"
            :src="embedSrc[viewId as EmbeddedShellWindowId]"
            :title="`Nebula Studio — ${viewId}`"
          />
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

.shell-brand-group {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.shell-bar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  -webkit-app-region: no-drag;
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
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
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: calc(100vh - var(--shell-top));
}

.shell-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  padding: 22px 16px;
  background: hsl(var(--background-deep) / 96%);
  border-right: 1px solid hsl(var(--border) / 82%);
}

.sidebar-group,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 32%);
  border: 1px solid transparent;
  border-radius: 14px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
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

.shell-main {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
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
  pointer-events: auto;
  background: hsl(var(--background));
  border: 0;
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
  .shell-body {
    grid-template-columns: 1fr;
  }

  .shell-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px 10px;
  }

  .sidebar-group,
  .sidebar-footer {
    flex-direction: row;
    gap: 8px;
  }

  .sidebar-item {
    flex: 1;
  }

  .shell-bar {
    padding: 0 12px;
  }

  .auth-dropdown {
    right: -4px;
  }
}
</style>
