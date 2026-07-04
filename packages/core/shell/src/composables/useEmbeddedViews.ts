/**
 * 嵌入视图状态管理 composable。
 *
 * 从 `frontend/App.vue` 提取（Plan-11 Task 10）。
 * 管理 iframe 嵌入的 URL 构建、加载状态、生命周期。
 */
import {
  WEB_SHELL_EMBED_QUERY,
  getEmbeddedShellWindowIds,
  getShellHostBridge,
} from '@nebula-studio/app-shell';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { computed, ref } from 'vue';

export interface EmbeddedViewsOptions {
  /** 集成面板是否打开 */
  integrationOpen: { value: boolean };
  /** 同步 electron embedded content 可见性 */
  syncEmbeddedContentVisible?: () => void;
}

export function useEmbeddedViews(opts: EmbeddedViewsOptions) {
  const shellHost = getShellHostBridge();
  const usesIframeEmbed = shellHost.usesIframeEmbed;
  const embeddedViewIds = getEmbeddedShellWindowIds();

  /** 构建嵌入表面 URL */
  function buildEmbeddedSurfaceUrl(viewId: EmbeddedShellWindowId): string {
    if (shellHost.kind === 'electron') {
      const url = new URL(window.location.href);
      url.hash = '';
      url.searchParams.set('renderer', viewId);
      return url.href;
    }
    const base = import.meta.env.BASE_URL ?? '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const qs = `${WEB_SHELL_EMBED_QUERY}=${encodeURIComponent(viewId)}`;
    return `${normalizedBase}index.html?${qs}`;
  }

  /** 各嵌入视图的 iframe src */
  const embedSrc = computed(() => {
    const out = {} as Record<EmbeddedShellWindowId, string>;
    for (const id of embeddedViewIds) {
      out[id] = buildEmbeddedSurfaceUrl(id);
    }
    return out;
  });

  /** 已创建过的 iframe，懒加载 + v-show 保活 */
  const loadedEmbedIds = ref<Set<string>>(new Set());
  /** 已完成首次渲染的子应用 */
  const embedReadyViewIds = ref<Set<string>>(new Set());
  const embedLoadingViewId = ref<string | null>(null);

  const EMBED_SURFACE_MIN_LOADING_MS = 320;
  const EMBED_SURFACE_LOAD_TIMEOUT_MS = 12_000;
  const embedLoadStartedAtByViewId = new Map<string, number>();
  const embedLoadTimeoutByViewId = new Map<string, number>();

  function syncShellEmbeddedContentVisible(): void {
    if (usesIframeEmbed) return;
    window.electron.ipcRenderer.invoke('shell:set-embedded-content-visible', {
      visible: !opts.integrationOpen.value,
    });
  }

  function markEmbedLoaded(viewId: string): void {
    loadedEmbedIds.value.add(viewId);
  }

  function markEmbedReady(viewId: string): void {
    embedReadyViewIds.value.add(viewId);
  }

  function isEmbedLoaded(viewId: string): boolean {
    return loadedEmbedIds.value.has(viewId);
  }

  function isEmbedReady(viewId: string): boolean {
    return embedReadyViewIds.value.has(viewId);
  }

  return {
    embeddedViewIds,
    embedSrc,
    loadedEmbedIds,
    embedReadyViewIds,
    embedLoadingViewId,
    EMBED_SURFACE_MIN_LOADING_MS,
    EMBED_SURFACE_LOAD_TIMEOUT_MS,
    embedLoadStartedAtByViewId,
    embedLoadTimeoutByViewId,
    syncShellEmbeddedContentVisible,
    markEmbedLoaded,
    markEmbedReady,
    isEmbedLoaded,
    isEmbedReady,
    buildEmbeddedSurfaceUrl,
  };
}
