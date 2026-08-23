import type { HostLocaleCapability } from '@nebula-studio/application-contract';
import type { NebulaLocale } from '@nebula-studio/i18n';

import {
  applyDomLocale,
  LOCALE_STORAGE_KEY,
  normalizeNebulaLocale,
  readStoredLocale,
  writeStoredLocale,
} from '@nebula-studio/i18n';

interface SettingsLocaleBridge {
  getLocale?(): Promise<string | undefined>;
  onLocaleChanged?(listener: (payload: { locale: string }) => void): () => void;
  setLocale?(locale: string): Promise<unknown>;
}

function settingsLocaleBridge(): SettingsLocaleBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const api = (window as Window & { api?: { settings?: SettingsLocaleBridge } })
    .api?.settings;
  return api;
}

function webStorage(): Storage | undefined {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }
  return localStorage;
}

function isTrackedLocaleKey(key: null | string): boolean {
  return key === LOCALE_STORAGE_KEY;
}

let sharedLocaleCapability: HostLocaleCapability | undefined;

export function createHostLocaleCapability(): HostLocaleCapability {
  if (sharedLocaleCapability) {
    return sharedLocaleCapability;
  }

  let current = readStoredLocale(webStorage());
  const listeners = new Set<(locale: string) => void>();

  function notify(locale: NebulaLocale): void {
    applyDomLocale(locale);
    for (const listener of listeners) {
      listener(locale);
    }
  }

  function applyExternal(locale: NebulaLocale): void {
    if (current === locale) {
      applyDomLocale(locale);
      return;
    }
    current = locale;
    notify(locale);
  }

  function persistAndPublish(locale: NebulaLocale): void {
    current = locale;
    writeStoredLocale(webStorage(), locale);
    notify(locale);
  }

  void (async () => {
    const fromMain = await settingsLocaleBridge()?.getLocale?.();
    if (fromMain) {
      applyExternal(normalizeNebulaLocale(fromMain));
    } else {
      applyDomLocale(current);
    }
  })();

  settingsLocaleBridge()?.onLocaleChanged?.((payload) => {
    applyExternal(normalizeNebulaLocale(payload.locale));
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (!isTrackedLocaleKey(event.key) || !event.newValue) {
        return;
      }
      applyExternal(normalizeNebulaLocale(event.newValue));
    });
  }

  const capability: HostLocaleCapability = {
    get locale() {
      return current;
    },
    async setLocale(next) {
      const locale = normalizeNebulaLocale(next);
      const bridge = settingsLocaleBridge();
      if (bridge?.setLocale) {
        const saved = await bridge.setLocale(locale);
        persistAndPublish(normalizeNebulaLocale(saved ?? locale));
        return;
      }
      persistAndPublish(locale);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(current);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  sharedLocaleCapability = capability;
  return capability;
}
