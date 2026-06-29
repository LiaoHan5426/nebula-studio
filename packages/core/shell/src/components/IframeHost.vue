<!--
  iframe 嵌入宿主组件。

  从 `frontend/App.vue` 提取（Plan-11 Task 9）。
  管理子应用 iframe 的渲染、加载过渡、空状态展示。
-->
<script setup lang="ts">
import { computed } from 'vue';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { getShellIntegratedAppMeta } from '@nebula-studio/app-shell';

const props = defineProps<{
  /** 是否为 iframe 嵌入模式（Web），false 时为 Electron BrowserView 模式 */
  usesIframeEmbed: boolean;
  /** 所有可用的视图 ID */
  availableViewIds: string[];
  /** 各视图的 iframe src URL */
  embedSrc: Record<EmbeddedShellWindowId, string>;
  /** 已创建过的 iframe ID 集合（懒加载 + v-show 保活） */
  loadedEmbedIds: Set<string>;
  /** 已完成首次渲染的视图 ID 集合 */
  embedReadyViewIds: Set<string>;
  /** 当前正在加载的视图 ID（null 表示无加载中的视图） */
  embedLoadingViewId: string | null;
  /** 当前激活的视图 ID */
  activeViewId: string | null;
  /** 集成面板是否打开（打开时隐藏空状态） */
  integrationOpen: boolean;
  /** 解析视图标签 */
  resolveViewLabel: (viewId: string) => string;
}>();

defineEmits<{
  /** iframe 加载完成 */
  'embed-load': [viewId: string];
}>();

const showTransition = computed(
  () =>
    props.embedLoadingViewId !== null &&
    props.embedLoadingViewId === props.activeViewId,
);

const transitionLabel = computed(() => {
  const viewId = props.embedLoadingViewId;
  return viewId ? props.resolveViewLabel(viewId) : '';
});

const transitionIconSvg = computed(() => {
  const viewId = props.embedLoadingViewId;
  if (!viewId || !props.availableViewIds.includes(viewId)) return '';
  return getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId).iconSvg;
});

function isReady(viewId: string): boolean {
  return (
    props.embedReadyViewIds.has(viewId) && props.embedLoadingViewId !== viewId
  );
}
</script>

<template>
  <div class="shell-embed-host">
    <div v-if="usesIframeEmbed" class="shell-embed">
      <template v-for="viewId in availableViewIds" :key="viewId">
        <iframe
          v-if="loadedEmbedIds.has(viewId)"
          v-show="viewId === activeViewId"
          class="shell-embed-frame"
          :class="{ 'is-surface-ready': isReady(viewId) }"
          :src="embedSrc[viewId as EmbeddedShellWindowId]"
          :title="`Nebula Studio — ${viewId}`"
          @load="$emit('embed-load', viewId)"
        />
      </template>
    </div>

    <Transition name="shell-embed-transition">
      <div
        v-if="showTransition"
        class="shell-embed-transition"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="shell-embed-transition-card">
          <div
            v-if="transitionIconSvg"
            class="shell-embed-transition-icon"
            v-html="transitionIconSvg"
          />
          <div class="shell-embed-transition-spinner" aria-hidden="true" />
          <p class="shell-embed-transition-title">
            正在打开 {{ transitionLabel }}
          </p>
          <p class="shell-embed-transition-hint">加载应用界面…</p>
        </div>
      </div>
    </Transition>

    <div v-if="!activeViewId && !integrationOpen" class="workspace-empty">
      <div class="workspace-empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h3 class="workspace-empty-title">暂无内容</h3>
      <p class="workspace-empty-desc">请从左侧导航或应用集成中选择一个应用</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shell-embed-host {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.shell-embed {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.shell-embed-frame {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  pointer-events: none;
  background: hsl(var(--background));
  border: 0;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.shell-embed-frame.is-surface-ready {
  pointer-events: auto;
  opacity: 1;
}

.shell-embed-transition {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background-deep) / 94%);
  backdrop-filter: blur(6px);
}

.shell-embed-transition-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  min-width: 220px;
  padding: 28px 32px;
  text-align: center;
  background: hsl(var(--card) / 88%);
  border: 1px solid hsl(var(--border) / 78%);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgb(2 4 12 / 22%);
}

.shell-embed-transition-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: hsl(var(--primary));
}

.shell-embed-transition-icon :deep(svg) {
  width: 44px;
  height: 44px;
}

.shell-embed-transition-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid hsl(var(--border) / 70%);
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: shell-embed-spin 0.75s linear infinite;
}

.shell-embed-transition-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.shell-embed-transition-hint {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.shell-embed-transition-enter-active,
.shell-embed-transition-leave-active {
  transition: opacity 0.2s ease;
}

.shell-embed-transition-enter-from,
.shell-embed-transition-leave-to {
  opacity: 0;
}

@keyframes shell-embed-spin {
  to {
    transform: rotate(360deg);
  }
}

.workspace-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--shell-top) - 60px);
  padding: 2rem;
  text-align: center;
}

.workspace-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: hsl(var(--muted-foreground));
}

.workspace-empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.workspace-empty-desc {
  margin: 0;
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
}
</style>
