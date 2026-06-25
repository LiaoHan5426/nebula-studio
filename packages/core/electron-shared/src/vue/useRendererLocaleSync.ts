import { onBeforeUnmount, onMounted, ref } from 'vue';
import { IPC_CHANNELS } from './rendererPreferences/ipcChannels.ts';

interface LocaleChangePayload {
  locale?: string;
}

interface IpcRendererLike {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  on(
    channel: string,
    listener: (event: unknown, payload: LocaleChangePayload) => void,
  ): void;
  removeListener(
    channel: string,
    listener: (event: unknown, payload: LocaleChangePayload) => void,
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

function normalizeLocale(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return fallback;
}

export interface UseRendererLocaleSyncOptions {
  /** When true, keep `document.documentElement.lang` in sync. */
  manageDom?: boolean;
  /** Used when IPC returns an empty value (should match main-process default). */
  fallbackLocale?: string;
}

export function useRendererLocaleSync(
  options: UseRendererLocaleSyncOptions = {},
) {
  const electron = resolveElectronLike();
  const fallback = options.fallbackLocale?.trim() || 'zh-CN';
  const locale = ref(fallback);
  const channels = IPC_CHANNELS.locale;

  const applyDomLocale = (value: string) => {
    if (!options.manageDom) return;
    document.documentElement.setAttribute('lang', value);
  };

  const onLocaleChanged = (
    _event: unknown,
    payload: LocaleChangePayload,
  ): void => {
    locale.value = normalizeLocale(payload?.locale, fallback);
    applyDomLocale(locale.value);
  };

  const setLocale = async (next: string): Promise<string> => {
    const normalized = normalizeLocale(next, fallback);
    locale.value = (await electron.ipcRenderer.invoke(channels.set, {
      locale: normalized,
    })) as string;
    applyDomLocale(locale.value);
    return locale.value;
  };

  onMounted(async () => {
    const initial = await electron.ipcRenderer.invoke(channels.get);
    locale.value = normalizeLocale(initial, fallback);
    applyDomLocale(locale.value);
    electron.ipcRenderer.on(channels.changed, onLocaleChanged);
  });

  onBeforeUnmount(() => {
    electron.ipcRenderer.removeListener(channels.changed, onLocaleChanged);
  });

  return {
    locale,
    setLocale,
  };
}
