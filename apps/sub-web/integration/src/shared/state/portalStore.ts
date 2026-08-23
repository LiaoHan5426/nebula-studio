import type { AccessRequestDraft } from '@/features/resource-catalog/types';

import { defineStore } from '@nebula-studio/state';

/** Device-scoped favorites/recents. */
export const PORTAL_DEVICE_PERSIST_KEY = 'nebula.integration.portal.v1';
/** Session-scoped access-request drafts (cleared on tenant/logout). */
export const PORTAL_SESSION_PERSIST_KEY =
  'nebula.integration.portal.session.v1';
export const UI_DEVICE_PERSIST_KEY = 'nebula.integration.ui.v1';

/** @deprecated use PORTAL_DEVICE_PERSIST_KEY */
export const PORTAL_PERSIST_KEY = PORTAL_DEVICE_PERSIST_KEY;

export const usePortalStore = defineStore('portal', {
  state: () => ({
    favorites: [] as string[],
    recents: [] as string[],
    drafts: {} as Record<string, AccessRequestDraft>,
  }),
  actions: {
    toggleFavorite(id: string) {
      this.favorites = this.favorites.includes(id)
        ? this.favorites.filter((item) => item !== id)
        : [id, ...this.favorites];
    },
    recordRecent(id: string) {
      this.recents = [id, ...this.recents.filter((item) => item !== id)].slice(
        0,
        8,
      );
    },
    writeDraft(resourceId: string, draft: AccessRequestDraft) {
      this.drafts = { ...this.drafts, [resourceId]: { ...draft } };
    },
    readDraft(resourceId: string): Partial<AccessRequestDraft> {
      return this.drafts[resourceId] ?? {};
    },
    clearDraft(resourceId: string) {
      const next = { ...this.drafts };
      delete next[resourceId];
      this.drafts = next;
    },
    resetForSessionChange() {
      this.drafts = {};
    },
  },
});

export const useIntegrationUiStore = defineStore('integrationUi', {
  state: () => ({
    pluginKeyword: '',
    pluginCategory: '',
  }),
});
