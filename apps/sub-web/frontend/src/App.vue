<script setup lang="ts">
/**
 * App.vue — Shell 组装层。
 *
 * Plan-11: 组件已拆出至 `@nebula-studio/nebula-shell`。
 * 本文件负责组装 OrgSwitcher / IframeHost / AppDock 并保留生命周期与 IPC 胶水逻辑。
 */
import {
  embeddedViewRequiresShellAuth,
  getShellIntegratedAppMeta,
  isShellIntegrableAppId,
  isShellStandaloneSidebarApp,
  postShellEmbedNavigate,
} from '@nebula-studio/app-shell';
import type {
  EmbeddedShellWindowId,
  ShellAuthSessionPayload,
  ShellEmbedPageMetaPayload,
} from '@nebula-studio/app-shell';
import {
  NebulaShellLayout,
  useLayoutPreferences,
} from '@nebula-studio/nebula-layout';
import {
  AppDock,
  GlobalCommandPalette,
  IframeHost,
  NotificationCenter,
  OrgSwitcher,
  PersonalWorkspace,
  useAppLifecycle,
} from '@nebula-studio/nebula-shell';
import type {
  GlobalSearchItem,
  WorkspaceLink,
  WorkspaceModel,
} from '@nebula-studio/nebula-shell';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { useOrganization } from '@/shared/composables/useOrganization';
import TaskGuidePanel from '@/components/TaskGuidePanel.vue';

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
const authSession = ref<ShellAuthSessionPayload | null>(null);

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
  shellTagItems,
  activeShellTagKey,
  showShellTagsBar,
  shellBreadcrumbItems,
  visitedViewIds,
  usesIframeEmbed,
  shellHost,
  // Actions
  loadShellState,
  applyTheme,
  logout,
  reportShellViewport,
  resolveShellViewLabel,
  getEmbedIframe,
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
  syncShellAuthSessionStorage,
  onThemeChanged,
  onAuthSessionChanged,
  onAuthLoginDismissed,
  syncShellEmbeddedContentVisible,
  activeViewPersistReady,
  standaloneSidebarAppIds,
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
// `standaloneSidebarAppIds` 由 useAppLifecycle 提供，
// 自动根据 windows.json 中 `integratable: false` 推导独立侧边栏应用列表。
const commandPaletteOpen = ref(false);
const taskGuideOpen = ref(false);
const activePageMeta = ref<ShellEmbedPageMetaPayload | null>(null);
const currentHelpKey = computed(
  () =>
    activePageMeta.value?.helpKey ??
    (activeViewId.value
      ? getShellIntegratedAppMeta(activeViewId.value as EmbeddedShellWindowId)
          .helpKey
      : 'shell.workspace'),
);
const pendingEmbedPaths = new Map<string, string>();
const shellRecoveryKind = computed(() =>
  activeViewId.value &&
  embeddedViewRequiresShellAuth(activeViewId.value) &&
  !authSession.value
    ? ('session-expired' as const)
    : null,
);

const resolvedBreadcrumbItems = computed(() => {
  const items = [...shellBreadcrumbItems.value];
  const pageTitle = activePageMeta.value?.title;
  if (pageTitle && items.at(-1)?.label !== pageTitle) {
    items.push({
      key: `page-${activePageMeta.value?.path ?? pageTitle}`,
      label: pageTitle,
      icon: 'file' as const,
    });
  }
  return items;
});

const workspaceModel = computed<WorkspaceModel>(() => ({
  summaries: [
    {
      id: 'requests',
      label: '访问申请',
      value: 0,
      description: '暂无待处理申请',
      tone: 'info',
      action: {
        id: 'requests',
        title: '查看我的申请',
        viewId: 'integration',
        path: '/subscriptions',
      },
    },
    {
      id: 'tasks',
      label: '待办任务',
      value: 0,
      description: '当前无待办',
      tone: 'success',
    },
    {
      id: 'incidents',
      label: '运行异常',
      value: 0,
      description: '当前无异常',
      tone: 'neutral',
    },
    {
      id: 'resources',
      label: '常用资源',
      value: 0,
      description: '等待资源目录接入',
      tone: 'neutral',
      action: {
        id: 'catalog',
        title: '打开资源目录',
        viewId: 'integration',
        path: '/catalog',
      },
    },
  ],
  recent: visitedViewIds.value
    .toReversed()
    .slice(0, 5)
    .map((viewId) => {
      const meta = getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId);
      return {
        id: `recent-${viewId}`,
        title: meta.label,
        description: meta.description,
        viewId,
        icon: 'history',
      };
    }),
  commonResources: [],
  quickActions: [
    {
      id: 'find-resource',
      title: '查找资源',
      description: '搜索 API、库表与 Connector',
      viewId: 'integration',
      path: '/catalog',
      icon: 'search',
    },
    {
      id: 'my-requests',
      title: '跟进申请',
      description: '查看申请与订阅进度',
      viewId: 'integration',
      path: '/subscriptions',
      icon: 'clipboard-check',
    },
    {
      id: 'appearance',
      title: '调整外观',
      description: '设置主题与工作区密度',
      viewId: 'settings',
      path: '/appearance',
      icon: 'palette',
    },
    {
      id: 'create-resource',
      title: '创建资源',
      description: '进入提供方资源登记流程',
      viewId: 'integration',
      path: '/service/register',
      icon: 'circle-plus',
    },
  ],
}));

const globalSearchItems = computed<GlobalSearchItem[]>(() => {
  const roles = new Set(authSession.value?.roles ?? []);
  const apps = availableViewIds.value
    .map((viewId) => getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId))
    .filter((meta) => {
      const required = meta.roles ?? [];
      return (
        !required.length ||
        required.includes('public') ||
        (required.includes('authenticated') && Boolean(authSession.value)) ||
        required.some((role) => roles.has(role))
      );
    })
    .map(
      (meta): GlobalSearchItem => ({
        id: `app-${meta.id}`,
        kind: 'app',
        title: meta.label,
        description: meta.description,
        viewId: meta.id,
        icon: 'layout-grid',
        keywords: meta.searchKeywords,
        roles: meta.roles,
      }),
    );
  return [
    ...apps,
    {
      id: 'resource-catalog',
      kind: 'resource',
      title: '资源目录',
      description: '查找 API、库表和 Connector',
      viewId: 'integration',
      path: '/catalog',
      icon: 'database',
      keywords: ['资源', '申请', '订阅'],
    },
    {
      id: 'workspace-help',
      kind: 'document',
      title: '工作台与全局体验指南',
      description: '了解工作台、恢复状态和键盘操作',
      viewId: 'docs',
      path: '/help/consumer/getting-started',
      icon: 'book-open',
    },
    {
      id: 'manage-apps',
      kind: 'action',
      title: '管理应用启动器',
      description: '筛选、排序、隐藏或重新启用应用',
      icon: 'layout-grid',
    },
  ];
});

watch(
  [activeViewId, activePageMeta],
  ([viewId, pageMeta]) => {
    const label = viewId ? resolveShellViewLabel(viewId) : '工作台';
    document.title = `${pageMeta?.title ?? label} — Nebula Studio`;
  },
  { immediate: true },
);

watch(activeViewId, (viewId) => {
  if (activePageMeta.value?.appId !== viewId) activePageMeta.value = null;
});

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
    loadedEmbedIds.value.add(activeViewId.value);
    ensureEmbedSurfaceLoading(activeViewId.value);
    await tryCompleteEmbedFromExistingFrame(activeViewId.value);
    // 根据当前 activeView 同步侧边栏高亮（独立侧边栏应用 / integration / workspace）
    if (isShellStandaloneSidebarApp(activeViewId.value)) {
      selectedSidebarItem.value = activeViewId.value;
    } else if (isShellIntegrableAppId(activeViewId.value)) {
      selectedSidebarItem.value = 'integration';
    } else {
      selectedSidebarItem.value = 'workspace';
    }
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
  window.addEventListener('keydown', onGlobalKeydown);
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
  window.removeEventListener('keydown', onGlobalKeydown);
});

function onGlobalKeydown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    commandPaletteOpen.value = !commandPaletteOpen.value;
  }
}

async function activateWorkspaceLink(item: WorkspaceLink): Promise<void> {
  if (item.id === 'manage-apps') {
    openIntegrationLauncher();
    return;
  }
  if (!item.viewId) return;
  if (item.path) pendingEmbedPaths.set(item.viewId, item.path);
  await selectIntegratedApp(item.viewId);
  await nextTick();
  const frame = getEmbedIframe(item.viewId);
  if (frame?.contentWindow && item.path) {
    postShellEmbedNavigate(frame.contentWindow, item.path);
    pendingEmbedPaths.delete(item.viewId);
  }
}

async function navigateFromTaskGuide(target: {
  viewId: string;
  path: string;
}): Promise<void> {
  await activateWorkspaceLink({
    id: `task-guide-${target.viewId}`,
    title: '任务引导',
    ...target,
  });
}

function onEmbedLoadWithNavigation(viewId: string): void {
  onEmbedIframeLoad(viewId);
  const path = pendingEmbedPaths.get(viewId);
  if (!path) return;
  postShellEmbedNavigate(getEmbedIframe(viewId)?.contentWindow, path);
  pendingEmbedPaths.delete(viewId);
}

function onPageMeta(viewId: string, payload: ShellEmbedPageMetaPayload): void {
  if (viewId === activeViewId.value) activePageMeta.value = payload;
}

function retryEmbed(viewId: string): void {
  const frame = getEmbedIframe(viewId);
  if (frame) frame.src = embedSrc.value[viewId as EmbeddedShellWindowId];
}

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
      :breadcrumbs="resolvedBreadcrumbItems"
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
      @refresh="refreshActiveShellSurface"
      @content-fullscreen-change="reportShellViewport"
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
          v-for="appId in standaloneSidebarAppIds"
          :key="appId"
          type="button"
          class="nebula-layout-nav-item"
          :class="{ 'is-active': selectedSidebarItem === appId }"
          @click="selectIntegratedApp(appId)"
        >
          <span
            class="nebula-layout-nav-item__icon"
            v-html="getShellIntegratedAppMeta(appId).iconSvg"
          />
          <span class="nebula-layout-nav-item__label">{{
            getShellIntegratedAppMeta(appId).label
          }}</span>
        </button>
      </template>

      <template #header-actions>
        <button
          type="button"
          class="shell-help-button"
          title="上下文帮助与任务引导"
          aria-label="上下文帮助与任务引导"
          @click="taskGuideOpen = true"
        >
          ?
        </button>
        <NotificationCenter @activate="activateWorkspaceLink" />
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
          :recovery-kind="shellRecoveryKind"
          @embed-load="onEmbedLoadWithNavigation"
          @page-meta="onPageMeta"
          @retry="retryEmbed"
          @workspace="openWorkspace"
          @login="handleLogin"
        >
          <template #workspace>
            <PersonalWorkspace
              :username="authSession?.user"
              :model="workspaceModel"
              @activate="activateWorkspaceLink"
              @search="commandPaletteOpen = true"
              @manage-apps="openIntegrationLauncher"
            />
          </template>
        </IframeHost>

        <AppDock
          :open="integrationOpen"
          :closable="integrationClosable"
          v-model:grid-view-ids="integrationGridViewIds"
          :dormant-integrable-ids="dormantIntegrableIds"
          :roles="authSession?.roles"
          :recent-view-ids="visitedViewIds"
          @select-app="selectIntegratedApp"
          @hide-app="hideIntegratedApp"
          @enable-app="enableIntegratedApp"
          @reorder="onSortEndReorder"
          @close="closeIntegrationLauncher"
        />
      </div>
    </NebulaShellLayout>
    <GlobalCommandPalette
      v-model:open="commandPaletteOpen"
      :items="globalSearchItems"
      @activate="activateWorkspaceLink"
    />
    <TaskGuidePanel
      v-model:open="taskGuideOpen"
      :authenticated="Boolean(authSession)"
      :help-key="currentHelpKey"
      @navigate="navigateFromTaskGuide"
    />
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

.shell-help-button {
  width: 34px;
  height: 34px;
  font-size: 16px;
  font-weight: 800;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted) / 48%);
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
}

@media (width <= 960px) {
  .shell-main {
    height: calc(100vh - var(--shell-top));
  }
}
</style>
