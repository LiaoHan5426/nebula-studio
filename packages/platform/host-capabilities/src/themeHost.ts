import type { HostThemeCapability } from '@nebula-studio/application-contract';
import type { NebulaStorage } from '@nebula-studio/storage';
import type { ResolvedTheme, ThemePreference } from '@nebula-studio/tokens';

import { readWebAuthSession } from '@nebula-studio/auth-provider/storage';
import { createWebStorage } from '@nebula-studio/storage';
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
  onThemeChanged?(
    listener: (payload: {
      preference?: ThemePreference;
      theme?: 'dark' | 'light' | 'system';
    }) => void,
  ): () => void;
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

function isColorScheme(
  value: unknown,
): value is ThemePreference['colorScheme'] {
  return value === 'dark' || value === 'light' || value === 'system';
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

function loadUserPreference(): ThemePreference | undefined {
  const stored = webStorage()?.get<unknown>(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : undefined;
}

function readOrganizationId(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  return localStorage.getItem('nebula_current_org_id')?.trim() || undefined;
}

async function fetchOrganizationPreference(): Promise<
  ThemePreference | undefined
> {
  const organizationId = readOrganizationId();
  const token = readWebAuthSession()?.token?.trim();
  if (!organizationId || !token || typeof fetch !== 'function')
    return undefined;
  const response = await fetch(
    `/api/system/organizations/${encodeURIComponent(organizationId)}/theme`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Organization-Id': organizationId,
      },
    },
  );
  if (!response.ok) return undefined;
  const payload = (await response.json()) as { data?: unknown };
  return isThemePreference(payload.data) ? payload.data : undefined;
}

function preferenceKey(preference: ThemePreference): string {
  return JSON.stringify(preference);
}

let sharedThemeCapability: HostThemeCapability | undefined;

/** @internal Test isolation only. */
export function resetHostThemeCapabilityForTests(): void {
  sharedThemeCapability = undefined;
}

export function createHostThemeCapability(): HostThemeCapability {
  if (sharedThemeCapability) {
    return sharedThemeCapability;
  }
  let userPreference = loadUserPreference();
  let organizationPreference: ThemePreference | undefined;
  let currentPreference = mergeThemePreference(
    userPreference,
    organizationPreference,
  );
  const listeners = new Set<(resolved: ResolvedTheme) => void>();

  function publish(persist: boolean): ResolvedTheme {
    if (persist) {
      persistPreference(currentPreference);
    }
    const resolved = resolveTheme(currentPreference, readSystemScheme());
    if (typeof document !== 'undefined') {
      applyResolvedTheme(document.documentElement, resolved);
    }
    for (const listener of listeners) {
      listener(resolved);
    }
    return resolved;
  }

  function applyExternal(next: ThemePreference): void {
    userPreference = next;
    const merged = mergeThemePreference(next, organizationPreference);
    if (preferenceKey(merged) === preferenceKey(currentPreference)) {
      return;
    }
    currentPreference = merged;
    resolved = publish(false);
  }

  let resolved = publish(false);

  const media =
    typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-color-scheme: dark)')
      : undefined;
  media?.addEventListener?.('change', () => {
    if (currentPreference.colorScheme === 'system') {
      resolved = publish(false);
    }
  });

  async function writePreference(next: ThemePreference): Promise<void> {
    userPreference = next;
    currentPreference = mergeThemePreference(next, organizationPreference);
    persistPreference(next);
    const bridge = settingsThemeBridge();
    if (bridge?.setPreference) {
      await bridge.setPreference(next);
    } else if (bridge?.setTheme) {
      await bridge.setTheme(next.colorScheme);
    }
    resolved = publish(false);
  }

  void (async () => {
    try {
      organizationPreference = await fetchOrganizationPreference();
      currentPreference = mergeThemePreference(
        userPreference,
        organizationPreference,
      );
      resolved = publish(false);
    } catch {
      // Organization defaults are optional; keep local/product preference.
    }
    const fromMain = await settingsThemeBridge()?.getPreference?.();
    if (isThemePreference(fromMain)) {
      applyExternal(fromMain);
    }
  })();

  settingsThemeBridge()?.onThemeChanged?.((payload) => {
    if (isThemePreference(payload.preference)) {
      applyExternal(payload.preference);
      return;
    }
    if (isColorScheme(payload.theme)) {
      applyExternal({ ...currentPreference, colorScheme: payload.theme });
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        const next = loadUserPreference();
        if (next) applyExternal(next);
      }
    });

    const bus = (
      window as Window & {
        __NEBULA_SHELL_EVENT_BUS__?: {
          on?(event: string, handler: () => void): () => void;
        };
      }
    ).__NEBULA_SHELL_EVENT_BUS__;
    bus?.on?.('tenant:changed', () => {
      void (async () => {
        try {
          organizationPreference = await fetchOrganizationPreference();
        } catch {
          organizationPreference = undefined;
        }
        currentPreference = mergeThemePreference(
          userPreference,
          organizationPreference,
        );
        resolved = publish(false);
      })();
    });
  }

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
