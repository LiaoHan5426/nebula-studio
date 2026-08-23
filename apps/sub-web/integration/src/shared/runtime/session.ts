import type { App } from 'vue';

import type { HostCapabilities } from '@nebula-studio/application-contract';

import {
  bindI18nToHostLocale,
  bootNebulaI18n,
  normalizeNebulaLocale,
} from '@nebula-studio/i18n';
import { createNebulaQueryClient } from '@nebula-studio/query';
import { createNebulaPinia } from '@nebula-studio/state';
import { createWebStorage } from '@nebula-studio/storage';

import { loadIntegrationMessages } from '@/i18n/loadMessages.ts';
import {
  PORTAL_DEVICE_PERSIST_KEY,
  PORTAL_SESSION_PERSIST_KEY,
  UI_DEVICE_PERSIST_KEY,
  usePortalStore,
} from '@/shared/state/portalStore';

export async function createIntegrationSession(
  capabilities: HostCapabilities | undefined,
) {
  const query = createNebulaQueryClient({ appId: 'integration' });
  const storage = createWebStorage();
  const pinia = createNebulaPinia({
    appId: 'integration',
    storage,
    persistStores: {
      portal: [
        {
          key: PORTAL_DEVICE_PERSIST_KEY,
          pick: ['favorites', 'recents'],
          privacy: 'device',
          schemaVersion: 1,
        },
        {
          key: PORTAL_SESSION_PERSIST_KEY,
          pick: ['drafts'],
          privacy: 'session',
          schemaVersion: 1,
        },
      ],
      integrationUi: {
        key: UI_DEVICE_PERSIST_KEY,
        pick: ['pluginKeyword', 'pluginCategory'],
        privacy: 'device',
        schemaVersion: 1,
      },
    },
  });
  const i18nHandle = await bootNebulaI18n({
    appId: 'integration',
    locale: normalizeNebulaLocale(capabilities?.locale?.locale),
    loadMessages: loadIntegrationMessages,
  });
  function resetSession(): void {
    query.client.clear();
    usePortalStore(pinia.pinia).resetForSessionChange();
    storage.clear({ privacy: 'session' });
  }

  function install(app: App): void {
    app.use(pinia.pinia);
    query.install(app);
    app.use(i18nHandle.i18n);
  }

  const stopLocale = bindI18nToHostLocale(i18nHandle, capabilities?.locale);

  function dispose(): void {
    stopLocale();
    i18nHandle.dispose();
    query.dispose();
    pinia.dispose();
  }

  return { query, pinia, i18nHandle, resetSession, install, dispose };
}
