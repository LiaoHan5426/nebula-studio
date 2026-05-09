<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { NebulaButton, NebulaThemeToggle } from '@nebula-studio/nebula-ui';
import Versions from './components/Versions.vue';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';

/** 顶栏高度须与 `apps/electron/app.config.ts` 中 `shell.topInsetPx` 一致 */
const SHELL_TOP_PX = 56;

const appMode = ref<AppMode>('build');
const theme = ref<ThemeMode>('dark');
const availableViewIds = ref<string[]>([]);
const activeViewId = ref<string | null>(null);

const modeLabel = computed(() => (appMode.value === 'dev' ? 'DEV' : 'BUILD'));

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

async function applyTheme(nextTheme: ThemeMode): Promise<void> {
  theme.value = await window.electron.ipcRenderer.invoke('settings:theme:set', {
    theme: nextTheme,
  });
}

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

const onThemeChanged = (
  _event: unknown,
  payload: { theme?: ThemeMode },
): void => {
  if (payload?.theme === 'light' || payload?.theme === 'dark') {
    theme.value = payload.theme;
  }
};

onMounted(async () => {
  await loadShellState();
  reportShellViewport();
  window.addEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  requestAnimationFrame(() => reportShellViewport());
});

onUnmounted(() => {
  window.removeEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.removeListener(
    'settings:theme:changed',
    onThemeChanged,
  );
});
</script>

<template>
  <div
    class="shell"
    :data-theme="theme"
    :style="{ '--shell-top': `${SHELL_TOP_PX}px` }"
  >
    <header class="shell-bar">
      <div class="shell-left">
        <span class="shell-brand">Nebula Studio</span>
        <span class="shell-badge">Host Shell</span>
        <span class="shell-desc">BrowserView container for renderer apps</span>
      </div>

      <div class="shell-center">
        <span class="mode-chip" :class="`mode-${appMode}`">
          <span class="mode-dot" />
          {{ modeLabel }}
        </span>

        <div class="view-switch">
          <button
            v-for="viewId in availableViewIds"
            :key="viewId"
            type="button"
            class="view-btn"
            :class="{ active: viewId === activeViewId }"
            @click="switchEmbeddedView(viewId)"
          >
            {{ viewId }}
          </button>
        </div>
      </div>

      <Versions class="shell-versions" />

      <div class="shell-actions">
        <NebulaThemeToggle
          class="shell-btn"
          :theme="theme"
          @update:theme="applyTheme"
        />
        <NebulaButton class="shell-btn" variant="primary" @click="ipcHandle">
          Ping 主进程
        </NebulaButton>
      </div>
    </header>
    <!-- 顶栏以下区域由 BrowserView 叠放绘制；壳层页面无需占位 DOM -->
  </div>
</template>

<style scoped>
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
  gap: 10px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.mode-chip {
  display: inline-flex;
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

.view-switch {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 2px;
  background: var(--chip-bg);
  border: 1px solid hsl(var(--border) / 80%);
  border-radius: 10px;
}

.view-btn {
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.view-btn.active {
  color: var(--text-main);
  background: hsl(var(--primary) / 26%);
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
}
</style>
