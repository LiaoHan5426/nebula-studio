/**
 * 应用集成状态管理 composable。
 *
 * 从 `frontend/App.vue` 提取（Plan-11 Task 10）。
 * 管理集成面板的打开/关闭、应用启用/隐藏、拖拽排序等状态。
 */
import { computed, nextTick, ref } from 'vue';
import {
  isShellIntegratableAppId,
  persistShellSurfacePreference,
} from '@nebula-studio/app-shell';

export interface UseAppIntegrationOptions {
  /** 可用视图 ID 列表（响应式） */
  availableViewIds: { value: string[] };
  /** 可排序视图 ID 列表（响应式） */
  sortableViewIds: { value: string[] };
  /** 当前激活的视图 ID（响应式） */
  activeViewId: { value: string | null };
  /** 已加载的嵌入 ID 集合（响应式） */
  loadedEmbedIds: { value: Set<string> };
  /** 嵌入就绪视图 ID 集合（响应式） */
  embedReadyViewIds: { value: Set<string> };
  /** 嵌入加载视图 ID（响应式） */
  embedLoadingViewId: { value: string | null };
  /** 选中侧边栏项（响应式） */
  selectedSidebarItem: { value: string };
  /** 宿主桥接 */
  shellHost: ReturnType<
    typeof import('@nebula-studio/app-shell').getShellHostBridge
  >;
  /** 是否使用 iframe 嵌入 */
  usesIframeEmbed: boolean;
  /** 顶部像素偏移 */
  shellTopPx: number;
  /** 切换嵌入视图 */
  switchEmbeddedView: (viewId: string) => Promise<void>;
  /** 启用嵌入视图 */
  enableEmbeddedView: (viewId: string) => Promise<boolean>;
  /** 禁用嵌入视图 */
  disableEmbeddedView: (viewId: string) => Promise<boolean>;
  /** 重排嵌入视图 */
  reorderEmbeddedViews: (orderedViewIds: string[]) => Promise<boolean>;
  /** 加载 Shell 状态 */
  loadShellState: () => Promise<void>;
  /** 确保嵌入表面加载中 */
  ensureEmbedSurfaceLoading: (viewId: string | null | undefined) => void;
  /** 尝试从已有 iframe 完成加载 */
  tryCompleteEmbedFromExistingFrame: (viewId: string) => void;
  /** 重置可集成嵌入 */
  resetIntegrableEmbedOnLeave: (viewId: string | null) => void;
  /** 报告 shell 视口 */
  reportShellViewport: () => void;
  /** 获取嵌入 iframe */
  getEmbedIframe: (viewId: string) => HTMLIFrameElement | null;
}

export function useAppIntegration(opts: UseAppIntegrationOptions) {
  const integrationOpen = ref(false);
  const integrationClosable = ref(false);
  const addPickerOpen = ref(false);
  const integrationPreferenceHydrated = ref(false);

  const sidebarSectionLabels: Record<string, string> = {
    workspace: '工作台',
    integration: '应用集成',
    settings: '设置',
  };

  /** 集成网格：排除侧栏固定入口 */
  const integrationGridViewIds = computed({
    get() {
      return opts.sortableViewIds.value.filter((viewId) =>
        isShellIntegratableAppId(viewId),
      );
    },
    set(next) {
      const pinned = opts.sortableViewIds.value.filter(
        (viewId) => !isShellIntegratableAppId(viewId),
      );
      opts.sortableViewIds.value = [...pinned, ...next];
    },
  });

  function commitIntegrationOpenNow(
    open: boolean,
    options?: { clearActiveViewOnOpen?: boolean },
  ): void {
    opts.shellHost.commitIntegrationOpen(open, options);
  }

  function syncShellEmbeddedContentVisible(): void {
    if (opts.usesIframeEmbed) return;
    window.electron.ipcRenderer.invoke('shell:set-embedded-content-visible', {
      visible: !integrationOpen.value,
    });
  }

  function persistCurrentShellSurface(): void {
    if (!opts.shellHost.shouldPersistActiveViewPreference) return;

    if (integrationOpen.value && opts.activeViewId.value) {
      persistShellSurfacePreference({
        kind: 'view',
        viewId: opts.activeViewId.value,
      });
      return;
    }
    if (integrationOpen.value) {
      persistShellSurfacePreference({ kind: 'integration' });
      return;
    }
    if (opts.activeViewId.value) {
      persistShellSurfacePreference({
        kind: 'view',
        viewId: opts.activeViewId.value,
      });
      return;
    }
    persistShellSurfacePreference({ kind: 'workspace' });
  }

  async function openWorkspace(): Promise<void> {
    opts.embedLoadingViewId.value = null;
    const prevViewId = opts.activeViewId.value;
    opts.selectedSidebarItem.value = 'workspace';
    integrationClosable.value = true;
    addPickerOpen.value = false;
    integrationOpen.value = false;
    opts.resetIntegrableEmbedOnLeave(prevViewId);
    opts.activeViewId.value = null;
    commitIntegrationOpenNow(false);
    if (!opts.usesIframeEmbed) {
      opts.reportShellViewport();
      await window.electron.ipcRenderer.invoke(
        'shell:clear-active-embedded-view',
      );
    }
  }

  async function selectIntegratedApp(viewId: string): Promise<void> {
    opts.loadedEmbedIds.value.add(viewId);
    opts.ensureEmbedSurfaceLoading(viewId);
    await opts.switchEmbeddedView(viewId);
    await nextTick();
    opts.tryCompleteEmbedFromExistingFrame(viewId);
    integrationOpen.value = false;
    integrationClosable.value = false;
    addPickerOpen.value = false;
  }

  async function enableIntegratedApp(viewId: string): Promise<void> {
    const ok = await opts.enableEmbeddedView(viewId);
    if (ok) {
      await opts.loadShellState();
      opts.sortableViewIds.value = [...opts.availableViewIds.value];
      addPickerOpen.value = false;
    }
  }

  async function hideIntegratedApp(viewId: string): Promise<void> {
    const ok = await opts.disableEmbeddedView(viewId);
    if (!ok) return;
    await opts.loadShellState();
    opts.sortableViewIds.value = [...opts.availableViewIds.value];
    addPickerOpen.value = false;
  }

  async function onSortEndReorder(orderedViewIds: string[]): Promise<void> {
    addPickerOpen.value = false;
    if (orderedViewIds.join('|') === opts.availableViewIds.value.join('|'))
      return;
    const ok = await opts.reorderEmbeddedViews(orderedViewIds);
    if (ok) {
      opts.availableViewIds.value = orderedViewIds;
    } else {
      await opts.loadShellState();
    }
  }

  function openIntegrationLauncher(): void {
    opts.selectedSidebarItem.value = 'integration';
    integrationClosable.value = false;
    addPickerOpen.value = false;
    integrationOpen.value = true;
    commitIntegrationOpenNow(true, { clearActiveViewOnOpen: false });
  }

  function returnToIntegrationHome(): void {
    integrationClosable.value = false;
    addPickerOpen.value = false;
    integrationOpen.value = true;
    commitIntegrationOpenNow(true, { clearActiveViewOnOpen: true });
  }

  function closeIntegrationLauncher(): void {
    if (!integrationClosable.value) return;
    integrationOpen.value = false;
    addPickerOpen.value = false;
    commitIntegrationOpenNow(false);
    if (!opts.activeViewId.value) {
      opts.selectedSidebarItem.value = 'workspace';
    }
  }

  return {
    integrationOpen,
    integrationClosable,
    addPickerOpen,
    integrationPreferenceHydrated,
    integrationGridViewIds,
    sidebarSectionLabels,
    commitIntegrationOpenNow,
    syncShellEmbeddedContentVisible,
    persistCurrentShellSurface,
    openWorkspace,
    selectIntegratedApp,
    enableIntegratedApp,
    hideIntegratedApp,
    onSortEndReorder,
    openIntegrationLauncher,
    returnToIntegrationHome,
    closeIntegrationLauncher,
  };
}
