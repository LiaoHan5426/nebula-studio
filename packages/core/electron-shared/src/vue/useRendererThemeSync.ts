import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { IPC_CHANNELS } from './rendererPreferences/ipcChannels.ts';
import { resolveRendererIpc } from './resolveRendererIpc.ts';
import { setupRendererThemeSync } from './setupRendererThemeSync.ts';

type ThemeMode = 'dark' | 'light';
type AppMode = 'build' | 'dev';

interface ThemeChangePayload {
  theme?: ThemeMode;
}

const THEME = IPC_CHANNELS.theme;

export interface UseRendererThemeSyncOptions {
  manageDom?: boolean;
}

export function useRendererThemeSync(
  options: UseRendererThemeSyncOptions = {},
) {
  const electron = { ipcRenderer: resolveRendererIpc() };
  const theme = ref<ThemeMode>('dark');
  const appMode = ref<AppMode>('build');
  const isDark = computed(() => theme.value === 'dark');
  let disposeDomSync: (() => void) | undefined;

  const onThemeChanged = (_event: unknown, ...args: unknown[]): void => {
    const payload = args[0] as ThemeChangePayload | undefined;
    theme.value = payload?.theme === 'light' ? 'light' : 'dark';
  };

  const setTheme = async (next: ThemeMode): Promise<ThemeMode> => {
    const normalized = next === 'light' ? 'light' : 'dark';
    theme.value = (await electron.ipcRenderer.invoke(THEME.set, {
      theme: normalized,
    })) as ThemeMode;
    return theme.value;
  };

  const toggleTheme = async (): Promise<ThemeMode> => {
    return setTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  const refreshAppMode = async (): Promise<AppMode> => {
    const next = await electron.ipcRenderer.invoke('shell:app-mode:get');
    appMode.value = next === 'dev' ? 'dev' : 'build';
    return appMode.value;
  };

  onMounted(async () => {
    if (options.manageDom) {
      disposeDomSync = setupRendererThemeSync();
    }
    theme.value = (await electron.ipcRenderer.invoke(THEME.get)) as ThemeMode;
    await refreshAppMode();
    electron.ipcRenderer.on(THEME.changed, onThemeChanged);
  });

  onBeforeUnmount(() => {
    electron.ipcRenderer.removeListener(THEME.changed, onThemeChanged);
    disposeDomSync?.();
    disposeDomSync = undefined;
  });

  return {
    theme,
    appMode,
    isDark,
    setTheme,
    toggleTheme,
    refreshAppMode,
  };
}
