<script setup lang="ts">
/**
 * App.vue — Shell 组装层。
 *
 * Plan-11: 组件已拆出至 `@nebula-studio/nebula-shell`。
 * 本文件负责组装 OrgSwitcher / IframeHost / AppDock 并保留生命周期与 IPC 胶水逻辑。
 */
import {
  NebulaShellLayout,
  useLayoutPreferences,
} from '@nebula-studio/nebula-layout';
import {
  AppDock,
  IframeHost,
  OrgSwitcher,
  useAppLifecycle,
} from '@nebula-studio/nebula-shell';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { useOrganization } from '@/shared/composables/useOrganization';

// ─── Organization ────────────────────────────────────────
const {
  orgEnabled,
  orgOptions,
  currentOrgId,
  orgLoading,
  canSwitchOrg,
  loadOrganizationContext,
  switchOrganization,
  resetOrganizationSession,
} = useOrganization();

// ─── Auth session ────────────────────────────────────────
const authSession = ref<{ user: string; token?: string } | null>(null);

// ─── Layout preferences ─────────────────────────────────
const { preferences: layoutPreferences } = useLayoutPreferences();

// ─── Lifecycle composable (destructured for template auto-unwrap) ──
const {
  theme,
  isThemeSwitching,
  selectedSidebarItem,
  activeViewId,
  availableViewIds,
  dormantIntegrableIds,
  integrationOpen,
  integrationClosable,
  addPickerOpen,
  integrationGridViewIds,
  preferencesOpen,
  embedSrc,
  loadedEmbedIds,
  embedReadyViewIds,
  embedLoadingViewId,
  shellTags,
  shellTagItems,
  activeShellTagKey,
  showShellTagsBar,
  shellBreadcrumbItems,
  usesIframeEmbed,
  shellTopPx,
  shellHost,
  // Actions
  loadShellState,
  applyTheme,
  logout,
  reportShellViewport,
  resolveShellViewLabel,
  onEmbedIframeLoad,
  ensureEmbedSurfaceLoading,
  tryCompleteEmbedFromExistingFrame,
  openWorkspace,
  selectIntegratedApp,
  enableIntegratedApp,
  hideIntegratedApp,
  openIntegrationLauncher,
  returnToIntegrationHome,
  closeIntegrationLauncher,
  onSortEndReorder,
  activateShellTag,
  closeShellTag,
  closeShellTagsLeftOfAnchor,
  closeShellTagsRightOfAnchor,
  closeOtherShellTags,
  closeAllShellTags,
  refreshActiveShellSurface,
  toggleShellContentFullscreen,
  syncShellAuthSessionStorage,
  onThemeChanged,
  onAuthSessionChanged,
  onAuthLoginDismissed,
  syncShellEmbeddedContentVisible,
  activeViewPersistReady,
} = useAppLifecycle({
  getAuthSession: () => authSession.value,
  setAuthSession: (s) => {
    authSession.value = s;
  },
  openLogin: async () => {
    await window.api.shell.openLogin();
  },
  refreshAuthSession: async () => {
    try {
      authSession.value = await window.api.auth.getSession();
      syncShellAuthSessionStorage(authSession.value);
    } catch {
      authSession.value = null;
      syncShellAuthSessionStorage(null);
    }
  },
  resetOrganizationSession,
  layoutPreferences,
});

// ── Computed helpers ────────────────────────────────────
const settingsAvailable = computed(() =>
  availableViewIds.value.includes('settings'),
);

// ─── Lifecycle hooks ─────────────────────────────────────
onMounted(async () => {
  shellHost.onBeforeShellHydrate();
  await loadShellState();

  const preferredSurface = shellHost.shouldRestoreActiveViewFromPreference
    ? (await import('@nebula-studio/app-shell')).readShellSurfacePreference()
    : null;

  if (
    preferredSurface?.kind === 'view' &&
    availableViewIds.value.includes(preferredSurface.viewId) &&
    preferredSurface.viewId !== activeViewId.value
  ) {
    if (!usesIframeEmbed) reportShellViewport();
    const ok = await window.electron.ipcRenderer.invoke(
      'shell:set-active-view',
      { viewId: preferredSurface.viewId },
    );
    if (ok) {
      activeViewId.value = preferredSurface.viewId;
      ensureEmbedSurfaceLoading(preferredSurface.viewId);
    }
  }

  addPickerOpen.value = false;
  integrationOpen.value = shellHost.resolveInitialIntegrationOpen(
    activeViewId.value,
  );
  activeViewPersistReady.value = true;
  shellHost.finalizeActiveViewOnMount({
    integrationOpen: integrationOpen.value,
    activeViewId: activeViewId.value,
  });
  syncShellEmbeddedContentVisible();

  if (integrationOpen.value) {
    selectedSidebarItem.value = 'integration';
  } else if (!activeViewId.value) {
    selectedSidebarItem.value = 'workspace';
  } else {
    selectedSidebarItem.value = 'workspace';
    loadedEmbedIds.value.add(activeViewId.value);
    ensureEmbedSurfaceLoading(activeViewId.value);
    await tryCompleteEmbedFromExistingFrame(activeViewId.value);
  }

  // Refresh auth
  try {
    authSession.value = await window.api.auth.getSession();
    syncShellAuthSessionStorage(authSession.value);
  } catch {
    authSession.value = null;
  }

  await loadOrganizationContext();
  reportShellViewport();
  if (!usesIframeEmbed) window.addEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  if (shellHost.shouldSubscribeAuthSessionChannel) {
    window.electron.ipcRenderer.on(
      'auth:session-changed',
      onAuthSessionChanged,
    );
    window.electron.ipcRenderer.on(
      'auth:login-dismissed',
      onAuthLoginDismissed,
    );
  }
  requestAnimationFrame(() => reportShellViewport());
});

onUnmounted(() => {
  shellHost.onShellUnmount();
  if (!usesIframeEmbed)
    window.removeEventListener('resize', reportShellViewport);
  window.electron.ipcRenderer.removeListener(
    'settings:theme:changed',
    onThemeChanged,
  );
  if (shellHost.shouldSubscribeAuthSessionChannel) {
    window.electron.ipcRenderer.removeListener(
      'auth:session-changed',
      onAuthSessionChanged,
    );
    window.electron.ipcRenderer.removeListener(
      'auth:login-dismissed',
      onAuthLoginDismissed,
    );
  }
});

async function onOrgChange(orgId: string): Promise<void> {
  await switchOrganization(orgId);
}

async function handleLogin(): Promise<void> {
  await window.api.shell.openLogin();
}
</script>

<template>
  <div
    class="shell"
    :class="{ 'theme-switching': isThemeSwitching }"
    :data-theme="theme"
  >
    <NebulaShellLayout
      v-model:preferences-open="preferencesOpen"
      :breadcrumbs="shellBreadcrumbItems"
      :show-tags-bar="showShellTagsBar"
      :tags="shellTagItems"
      :active-tag-key="activeShellTagKey"
      :theme="theme"
      :auth-user="authSession?.user"
      :show-auth="true"
      @update:theme="applyTheme"
      @login="handleLogin"
      @logout="logout"
      @tag-activate="activateShellTag"
      @tag-close="closeShellTag"
      @tags-close-left="closeShellTagsLeftOfAnchor"
      @tags-close-right="closeShellTagsRightOfAnchor"
      @tags-close-others="closeOtherShellTags"
      @tags-close-all="closeAllShellTags"
      @tags-refresh="refreshActiveShellSurface"
      @tags-fullscreen="toggleShellContentFullscreen"
      @refresh="refreshActiveShellSurface"
    >
      <template #sidebar-brand>
        <button
          type="button"
          class="nebula-layout-sidebar-brand nebula-layout-sidebar-brand--btn"
          title="返回应用集成"
          @click="returnToIntegrationHome"
        >
          <div class="nebula-layout-sidebar-brand__logo">N</div>
          <div class="nebula-layout-sidebar-brand__text">
            <div class="nebula-layout-sidebar-brand__title">Nebula Studio</div>
            <span class="nebula-layout-sidebar-brand__badge">Host Shell</span>
          </div>
        </button>
      </template>

      <template #sidebar>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': selectedSidebarItem === 'workspace' }"
          @click="openWorkspace"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">工作台</span>
        </button>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': selectedSidebarItem === 'integration' }"
          @click="openIntegrationLauncher"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">应用集成</span>
        </button>
        <button
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': activeViewId === 'settings' }"
          :disabled="!settingsAvailable"
          @click="selectIntegratedApp('settings')"
        >
          <span class="nebula-layout-nav-item__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              />
            </svg>
          </span>
          <span class="nebula-layout-nav-item__label">设置</span>
        </button>
      </template>

      <template #header-actions>
        <OrgSwitcher
          :enabled="orgEnabled"
          :options="orgOptions"
          :current-org-id="currentOrgId"
          :loading="orgLoading"
          :can-switch="canSwitchOrg"
          @switch="onOrgChange"
        />
      </template>

      <div class="shell-main">
        <IframeHost
          :uses-iframe-embed="usesIframeEmbed"
          :available-view-ids="availableViewIds"
          :embed-src="embedSrc"
          :loaded-embed-ids="loadedEmbedIds"
          :embed-ready-view-ids="embedReadyViewIds"
          :embed-loading-view-id="embedLoadingViewId"
          :active-view-id="activeViewId"
          :integration-open="integrationOpen"
          :resolve-view-label="resolveShellViewLabel"
          @embed-load="onEmbedIframeLoad"
        />

        <AppDock
          :open="integrationOpen"
          :closable="integrationClosable"
          v-model:grid-view-ids="integrationGridViewIds"
          :dormant-integrable-ids="dormantIntegrableIds"
          @select-app="selectIntegratedApp"
          @hide-app="hideIntegratedApp"
          @enable-app="enableIntegratedApp"
          @reorder="onSortEndReorder"
          @close="closeIntegrationLauncher"
        />
      </div>
    </NebulaShellLayout>
  </div>
</template>

<style lang="scss" scoped>
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

  position: relative;
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
}

.shell-main {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

@media (width <= 960px) {
  .shell-main {
    height: calc(100vh - var(--shell-top));
  }
}
</style>
