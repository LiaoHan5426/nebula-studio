import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { setupRendererThemeSync } from './setupRendererThemeSync';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';

interface ThemeChangePayload {
  theme?: ThemeMode;
}

interface IpcRendererLike {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  on(
    channel: string,
    listener: (event: unknown, payload: ThemeChangePayload) => void,
  ): void;
  removeListener(
    channel: string,
    listener: (event: unknown, payload: ThemeChangePayload) => void,
  ): void;
}

interface ElectronLike {
  ipcRenderer: IpcRendererLike;
}

function resolveElectronLike(): ElectronLike {
  const g = globalThis as { electron?: ElectronLike };
  if (!g.electron) {
    throw new Error(
      'window.electron is unavailable. Ensure preload exposes Electron API.',
    );
  }
  return g.electron;
}

export interface UseRendererThemeSyncOptions {
  manageDom?: boolean;
}

export function useRendererThemeSync(
  options: UseRendererThemeSyncOptions = {},
) {
  const electron = resolveElectronLike();
  const theme = ref<ThemeMode>('dark');
  const appMode = ref<AppMode>('build');
  const isDark = computed(() => theme.value === 'dark');
  let disposeDomSync: (() => void) | undefined;

  const onThemeChanged = (
    _event: unknown,
    payload: ThemeChangePayload,
  ): void => {
    theme.value = payload?.theme === 'light' ? 'light' : 'dark';
  };

  const setTheme = async (next: ThemeMode): Promise<ThemeMode> => {
    const normalized = next === 'light' ? 'light' : 'dark';
    theme.value = (await electron.ipcRenderer.invoke('settings:theme:set', {
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
    theme.value = (await electron.ipcRenderer.invoke(
      'settings:theme:get',
    )) as ThemeMode;
    await refreshAppMode();
    electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  });

  onBeforeUnmount(() => {
    electron.ipcRenderer.removeListener(
      'settings:theme:changed',
      onThemeChanged,
    );
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
