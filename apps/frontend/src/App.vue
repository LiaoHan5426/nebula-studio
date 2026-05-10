<script setup lang="ts">
import {
  WEB_SHELL_EMBED_QUERY,
  getEmbeddedShellWindowIds,
  getShellIntegratedAppMeta,
  isWebPresentationHost,
  shellPresentationConfig,
} from '@nebula-studio/app-shell';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { NebulaButton, NebulaThemeToggle } from '@nebula-studio/nebula-ui';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Versions from './components/Versions.vue';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';
const SHELL_INTEGRATION_OPEN_KEY = 'nebula-shell-integration-open';

const shellTopPx = shellPresentationConfig.shell.topInsetPx;
const isWebHost = isWebPresentationHost();

const embeddedViewIds = getEmbeddedShellWindowIds();

const embedSrc = computed(() => {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const out = {} as Record<EmbeddedShellWindowId, string>;
  for (const id of embeddedViewIds) {
    out[id] =
      `${normalizedBase}index.html?${WEB_SHELL_EMBED_QUERY}=${encodeURIComponent(id)}`;
  }
  return out;
});

const appMode = ref<AppMode>('build');
const theme = ref<ThemeMode>('dark');
const availableViewIds = ref<string[]>([]);
const dormantIntegratableIds = ref<string[]>([]);
const activeViewId = ref<string | null>(null);
const authSession = ref<{ user: string } | null>(null);
const integrationOpen = ref(true);
const integrationClosable = ref(false);
const addPickerOpen = ref(false);
const integrationPreferenceHydrated = ref(false);

const modeLabel = computed(() => (appMode.value === 'dev' ? 'DEV' : 'BUILD'));

const activeAppLabel = computed(() => {
  const id = activeViewId.value;
  if (id === 'docs' || id === 'settings') {
    return getShellIntegratedAppMeta(id).label;
  }
  return id ?? '—';
});

const authAvatarText = computed(() => {
  const raw = authSession.value?.user?.trim();
  if (!raw) return '?';
  return raw.slice(0, 1).toUpperCase();
});

function readIntegrationOpenPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(SHELL_INTEGRATION_OPEN_KEY);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    /* ignore */
  }
  return true;
}

function persistIntegrationOpenPreference(open: boolean): void {
  try {
    window.localStorage.setItem(SHELL_INTEGRATION_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
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
  dormantIntegratableIds.value = Array.isArray(state?.dormantIntegratableIds)
    ? state.dormantIntegratableIds
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

async function selectIntegratedApp(viewId: string): Promise<void> {
  await switchEmbeddedView(viewId);
  integrationOpen.value = false;
  integrationClosable.value = false;
  addPickerOpen.value = false;
}

async function enableAndOpenIntegratedApp(viewId: string): Promise<void> {
  const ok = await enableEmbeddedView(viewId);
  if (ok) {
    await loadShellState();
    integrationOpen.value = false;
    integrationClosable.value = false;
    addPickerOpen.value = false;
  }
}

function openIntegrationLauncher(): void {
  integrationClosable.value = true;
  addPickerOpen.value = false;
  integrationOpen.value = true;
}

function returnToIntegrationHome(): void {
  integrationClosable.value = false;
  addPickerOpen.value = false;
  integrationOpen.value = true;
}

function closeIntegrationLauncher(): void {
  if (!integrationClosable.value) return;
  integrationOpen.value = false;
  addPickerOpen.value = false;
}

async function applyTheme(nextTheme: ThemeMode): Promise<void> {
  theme.value = await window.electron.ipcRenderer.invoke('settings:theme:set', {
    theme: nextTheme,
  });
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
  if (!isWebHost) {
    await refreshAuthSession();
  }
}

const onThemeChanged = (
  _event: unknown,
  payload: { theme?: ThemeMode },
): void => {
  if (payload?.theme === 'light' || payload?.theme === 'dark') {
    theme.value = payload.theme;
  }
};

const onAuthSessionChanged = (
  _event: unknown,
  payload: { user: string } | null,
): void => {
  authSession.value = payload;
};

watch(
  integrationOpen,
  (open) => {
    if (integrationPreferenceHydrated.value) {
      persistIntegrationOpenPreference(open);
    }
    if (isWebHost) return;
    void window.electron.ipcRenderer.invoke(
      'shell:set-embedded-content-visible',
      { visible: !open },
    );
  },
  { immediate: true },
);

onMounted(async () => {
  await loadShellState();
  integrationOpen.value =
    activeViewId.value === null ? true : readIntegrationOpenPreference();
  integrationPreferenceHydrated.value = true;
  await refreshAuthSession();
  reportShellViewport();
  window.addEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  if (!isWebHost) {
    window.electron.ipcRenderer.on(
      'auth:session-changed',
      onAuthSessionChanged,
    );
  }
  requestAnimationFrame(() => reportShellViewport());
});

onUnmounted(() => {
  if (!isWebHost) {
    void window.electron.ipcRenderer.invoke(
      'shell:set-embedded-content-visible',
      { visible: true },
    );
  }
  window.removeEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.removeListener(
    'settings:theme:changed',
    onThemeChanged,
  );
  if (!isWebHost) {
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
    :data-theme="theme"
    :style="{ '--shell-top': `${shellTopPx}px` }"
  >
    <header class="shell-bar">
      <div class="shell-left">
        <button
          type="button"
          class="shell-brand shell-brand-btn"
          title="返回应用集成"
          @click="returnToIntegrationHome"
        >
          Nebula Studio
        </button>
        <span class="shell-badge">Host Shell</span>
        <span class="shell-desc">集成子应用工作台</span>
      </div>

      <div v-if="!integrationOpen" class="shell-center">
        <span class="mode-chip" :class="`mode-${appMode}`">
          <span class="mode-dot" />
          {{ modeLabel }}
        </span>

        <div class="shell-app-launcher-trigger">
          <span class="current-app-label" aria-live="polite">
            当前：<strong>{{ activeAppLabel }}</strong>
          </span>
          <NebulaButton
            class="integration-open-btn"
            variant="secondary"
            aria-haspopup="dialog"
            :aria-expanded="integrationOpen"
            @click="openIntegrationLauncher"
          >
            应用集成
          </NebulaButton>
        </div>
      </div>

      <Versions class="shell-versions" />

      <div class="shell-actions">
        <NebulaButton
          v-if="!authSession"
          class="shell-btn"
          variant="secondary"
          @click="openLogin"
        >
          登录
        </NebulaButton>
        <NebulaThemeToggle
          class="shell-btn"
          :theme="theme"
          @update:theme="applyTheme"
        />
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
    <!-- Electron：顶栏以下由 BrowserView 绘制。Web：用 iframe 模拟内嵌子应用。 -->
    <main v-if="isWebHost" class="shell-embed">
      <iframe
        v-for="viewId in availableViewIds"
        v-show="viewId === activeViewId"
        :key="viewId"
        class="shell-embed-frame"
        :src="embedSrc[viewId as EmbeddedShellWindowId]"
        :title="`Nebula Studio — ${viewId}`"
      />
    </main>

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
        @click="integrationClosable ? closeIntegrationLauncher() : undefined"
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
          点击下方图标进入已启用的子应用；使用加号可将默认未启用的应用加入工作台。
        </p>
        <div class="integration-panel-body">
          <div class="integration-grid">
            <button
              v-for="viewId in availableViewIds"
              :key="viewId"
              type="button"
              class="integration-tile"
              :class="{ active: viewId === activeViewId }"
              @click="selectIntegratedApp(viewId)"
            >
              <span
                class="integration-tile-icon"
                aria-hidden="true"
                v-html="
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .iconSvg
                "
              />
              <span class="integration-tile-label">{{
                getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId).label
              }}</span>
            </button>

            <button
              v-if="dormantIntegratableIds.length > 0"
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
            <div
              v-else
              class="integration-tile integration-tile-add integration-tile-muted"
              title="当前没有可添加的集成应用"
            >
              <span class="integration-plus" aria-hidden="true">+</span>
              <span class="integration-tile-label">添加应用</span>
            </div>
          </div>

          <div
            v-show="addPickerOpen && dormantIntegratableIds.length > 0"
            id="integration-add-list"
            class="integration-add-panel"
          >
            <p class="integration-add-heading">待启用的应用</p>
            <ul class="integration-add-list">
              <li
                v-for="viewId in dormantIntegratableIds"
                :key="viewId"
                class="integration-add-li"
              >
                <button
                  type="button"
                  class="integration-add-btn"
                  @click="enableAndOpenIntegratedApp(viewId)"
                >
                  <span
                    class="integration-tile-icon sm"
                    aria-hidden="true"
                    v-html="
                      getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                        .iconSvg
                    "
                  />
                  <span>{{
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .label
                  }}</span>
                  <span class="integration-add-hint">启用并打开</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
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
  gap: 10px;
  align-items: center;
  height: var(--shell-top);
  padding: 0 12px;
  font:
    13px/1.4 system-ui,
    sans-serif;
  background: var(--bar-bg);
  border-bottom: 1px solid var(--bar-border);
  box-shadow: 0 6px 20px rgb(8 9 14 / 18%);
  -webkit-app-region: drag;
}

.shell-left {
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
  min-width: 0;
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

.integration-overlay {
  position: fixed;
  inset: 0;
  top: var(--shell-top);
  z-index: 2;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  pointer-events: auto;
}

.integration-backdrop {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: rgb(8 10 18 / 52%);
  backdrop-filter: blur(2px);
  border: 0;
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

.integration-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 132px;
  padding: 16px 12px;
  color: var(--text-main);
  cursor: pointer;
  background: hsl(var(--muted) / 38%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 14px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.integration-tile:hover {
  background: hsl(var(--primary) / 10%);
  border-color: hsl(var(--primary) / 42%);
}

.integration-tile.active {
  background: hsl(var(--primary) / 16%);
  border-color: hsl(var(--primary) / 50%);
  box-shadow: inset 0 0 0 2px hsl(var(--primary) / 22%);
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
  border-style: solid;
  border-color: hsl(var(--primary) / 45%);
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
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--border) / 65%);
}

.integration-add-heading {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.4px;
  text-transform: uppercase;
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
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.shell-versions {
  flex-shrink: 0;
  overflow: visible;
  -webkit-app-region: no-drag;
}

.shell-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  -webkit-app-region: no-drag;
}

.shell-btn {
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.auth-menu {
  position: relative;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
  --auth-pop-bg: hsl(var(--card) / 98%);
  --auth-pop-border: hsl(var(--border) / 82%);
  --auth-pop-divider: hsl(var(--border) / 62%);
  --auth-pop-title: hsl(var(--muted-foreground));
  --auth-pop-text: hsl(var(--foreground));
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
  margin-top: 6px;
  padding: 12px;
  pointer-events: none;
  opacity: 0;
  background: var(--auth-pop-bg);
  border: 1px solid var(--auth-pop-border);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgb(2 4 12 / 26%);
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
  width: 100%;
  justify-content: center;
}

@media (width <= 1200px) {
  .shell-desc {
    display: none;
  }
}

@media (width <= 960px) {
  .shell-badge {
    display: none;
  }

  .shell-versions {
    display: none;
  }

  .mode-chip {
    display: none;
  }

  .current-app-label {
    display: none;
  }

  .auth-dropdown {
    right: -4px;
  }
}

.shell-embed {
  position: fixed;
  inset: 0;
  z-index: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: var(--shell-top);
  margin: 0;
  pointer-events: none;
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
</style>
