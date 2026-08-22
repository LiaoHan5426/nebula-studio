import { onBeforeUnmount, onMounted, ref } from 'vue';

import { IPC_CHANNELS } from './rendererPreferences/ipcChannels.ts';
import { resolveRendererIpc } from './resolveRendererIpc.ts';

interface LocaleChangePayload {
  locale?: string;
}

function normalizeLocale(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return fallback;
}

export interface UseRendererLocaleSyncOptions {
  /** Used when IPC returns an empty value (should match main-process default). */
  fallbackLocale?: string;
  /** When true, keep `document.documentElement.lang` in sync. */
  manageDom?: boolean;
}

export function useRendererLocaleSync(
  options: UseRendererLocaleSyncOptions = {},
) {
  const electron = { ipcRenderer: resolveRendererIpc() };
  const fallback = options.fallbackLocale?.trim() || 'zh-CN';
  const locale = ref(fallback);
  const channels = IPC_CHANNELS.locale;

  const applyDomLocale = (value: string) => {
    if (!options.manageDom) return;
    document.documentElement.setAttribute('lang', value);
  };

  const onLocaleChanged = (_event: unknown, ...args: unknown[]): void => {
    const payload = args[0] as LocaleChangePayload | undefined;
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
