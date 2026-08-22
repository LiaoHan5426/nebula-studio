import type { HostThemeCapability } from '@nebula-studio/application-contract';
import { createWebStorage } from '@nebula-studio/storage';
import type { NebulaStorage } from '@nebula-studio/storage';
import type { ResolvedTheme, ThemePreference } from '@nebula-studio/tokens';
import {
  applyResolvedTheme,
  mergeThemePreference,
  readSystemScheme,
  resolveTheme,
  THEME_STORAGE_KEY,
} from '@nebula-studio/tokens';

interface SettingsThemeBridge {
  getPreference?(): Promise<ThemePreference | undefined>;
  getTheme?(): Promise<'dark' | 'light' | 'system'>;
  setPreference?(preference: ThemePreference): Promise<unknown>;
  setTheme?(theme: 'dark' | 'light' | 'system'): Promise<unknown>;
}

function settingsThemeBridge(): SettingsThemeBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const api = (window as Window & { api?: { settings?: SettingsThemeBridge } })
    .api?.settings;
  return api;
}

function isThemePreference(value: unknown): value is ThemePreference {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as ThemePreference;
  return (
    (record.colorScheme === 'dark' ||
      record.colorScheme === 'light' ||
      record.colorScheme === 'system') &&
    (record.density === 'compact' || record.density === 'comfortable') &&
    (record.contrast === 'normal' || record.contrast === 'high') &&
    Boolean(record.accent)
  );
}

function webStorage(): NebulaStorage | undefined {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }
  return createWebStorage(localStorage);
}

function persistPreference(preference: ThemePreference): void {
  webStorage()?.set(THEME_STORAGE_KEY, preference, { privacy: 'device' });
}

function loadPreference(): ThemePreference {
  const stored = webStorage()?.get<unknown>(THEME_STORAGE_KEY);
  const user = isThemePreference(stored) ? stored : undefined;
  return mergeThemePreference(user);
}

let sharedThemeCapability: HostThemeCapability | undefined;

export function createHostThemeCapability(): HostThemeCapability {
  if (sharedThemeCapability) {
    return sharedThemeCapability;
  }
  let currentPreference = loadPreference();
  const listeners = new Set<(resolved: ResolvedTheme) => void>();

  function publish(): ResolvedTheme {
    const resolved = resolveTheme(currentPreference, readSystemScheme());
    if (typeof document !== 'undefined') {
      applyResolvedTheme(document.documentElement, resolved);
    }
    for (const listener of listeners) {
      listener(resolved);
    }
    return resolved;
  }

  let resolved = publish();

  const media =
    typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-color-scheme: dark)')
      : undefined;
  media?.addEventListener?.('change', () => {
    if (currentPreference.colorScheme === 'system') {
      resolved = publish();
    }
  });

  async function writePreference(next: ThemePreference): Promise<void> {
    currentPreference = next;
    persistPreference(next);
    const bridge = settingsThemeBridge();
    if (bridge?.setPreference) {
      await bridge.setPreference(next);
    } else if (bridge?.setTheme) {
      await bridge.setTheme(next.colorScheme);
    }
    resolved = publish();
  }

  void (async () => {
    const fromMain = await settingsThemeBridge()?.getPreference?.();
    if (isThemePreference(fromMain)) {
      currentPreference = mergeThemePreference(fromMain);
      persistPreference(currentPreference);
      resolved = publish();
    }
  })();

  const capability: HostThemeCapability = {
    get scheme() {
      return currentPreference.colorScheme;
    },
    get preference() {
      return currentPreference;
    },
    get resolved() {
      return resolved;
    },
    async setScheme(scheme) {
      await writePreference({ ...currentPreference, colorScheme: scheme });
    },
    async setPreference(next) {
      await writePreference(
        mergeThemePreference({ ...currentPreference, ...next }),
      );
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(resolved);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  sharedThemeCapability = capability;
  return capability;
}
