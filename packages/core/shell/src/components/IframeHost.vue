<!--
  iframe 嵌入宿主组件。

  从 `frontend/App.vue` 提取（Plan-11 Task 9）。
  管理子应用 iframe 的渲染、加载过渡、空状态展示。
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { getShellIntegratedAppMeta } from '@nebula-studio/app-shell';

const props = defineProps<{
  usesIframeEmbed: boolean;
  availableViewIds: string[];
  embedSrc: Record<EmbeddedShellWindowId, string>;
  loadedEmbedIds: Set<string>;
  embedReadyViewIds: Set<string>;
  embedLoadingViewId: string | null;
  activeViewId: string | null;
  integrationOpen: boolean;
  resolveViewLabel: (viewId: string) => string;
}>();

const emit = defineEmits<{
  'embed-load': [viewId: string];
}>();

function isReady(viewId: string): boolean {
  return (
    props.embedReadyViewIds.has(viewId) && props.embedLoadingViewId !== viewId
  );
}

const showTransition = computed(
  () =>
    props.embedLoadingViewId !== null &&
    props.embedLoadingViewId === props.activeViewId &&
    !props.integrationOpen,
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

const prevActiveViewId = ref<string | null>(null);
const isSwitching = ref(false);
const transitionReady = ref(true);
const enterPhase = ref(false);

const SWITCH_ENTER_MS = 300;
const SWITCH_LEAVE_MS = 280;

function isFrameVisible(viewId: string): boolean {
  if (props.integrationOpen) return false;
  if (viewId === props.activeViewId) return true;
  return isSwitching.value && viewId === prevActiveViewId.value;
}

function frameMotionClass(viewId: string): Record<string, boolean> {
  const isActive = viewId === props.activeViewId;
  const isLeaving = isSwitching.value && viewId === prevActiveViewId.value;
  const isEntering = isSwitching.value && isActive;

  if (isLeaving) {
    return { 'is-leaving': true };
  }
  if (isEntering) {
    return enterPhase.value ? { 'is-entered': true } : { 'is-entering': true };
  }
  if (!isSwitching.value && isActive && isReady(viewId)) {
    return { 'is-idle': true };
  }
  if (!isSwitching.value && isActive && !isReady(viewId)) {
    return { 'is-entering': true };
  }
  return {};
}

watch(
  () => props.activeViewId,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;

    prevActiveViewId.value = oldVal;
    isSwitching.value = true;
    transitionReady.value = false;
    enterPhase.value = false;

    requestAnimationFrame(() => {
      enterPhase.value = true;
    });

    const readyTimeout = window.setTimeout(() => {
      transitionReady.value = true;
    }, SWITCH_ENTER_MS);
    const cleanupTimeout = window.setTimeout(() => {
      isSwitching.value = false;
      prevActiveViewId.value = null;
      enterPhase.value = false;
    }, SWITCH_LEAVE_MS + 40);

    return () => {
      window.clearTimeout(readyTimeout);
      window.clearTimeout(cleanupTimeout);
    };
  },
);

watch(
  () => props.embedReadyViewIds,
  (readyIds) => {
    if (props.activeViewId && readyIds.has(props.activeViewId)) {
      transitionReady.value = true;
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="shell-embed-host">
    <div
      class="shell-embed-backdrop"
      :class="{ 'is-visible': isSwitching && !transitionReady }"
    />

    <div v-if="usesIframeEmbed" class="shell-embed">
      <template v-for="viewId in availableViewIds" :key="viewId">
        <iframe
          v-if="loadedEmbedIds.has(viewId)"
          v-show="isFrameVisible(viewId)"
          class="shell-embed-frame"
          :class="frameMotionClass(viewId)"
          :src="embedSrc[viewId as EmbeddedShellWindowId]"
          :title="`Nebula Studio — ${viewId}`"
          @load="emit('embed-load', viewId)"
        />
      </template>
    </div>

    <Transition name="shell-embed-transition">
      <div
        v-if="showTransition && !transitionReady"
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
  background: hsl(var(--background-deep));
}

.shell-embed-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: hsl(var(--background-deep));
  opacity: 0;
  transition: opacity 0.15s ease;
}

.shell-embed-backdrop.is-visible {
  opacity: 1;
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
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  pointer-events: none;
  background: hsl(var(--background-deep));
  border: 0;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shell-embed-frame.is-idle,
.shell-embed-frame.is-entered {
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
}

.shell-embed-frame.is-entering {
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
}

.shell-embed-frame.is-leaving {
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
}

.shell-embed-transition {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background-deep) / 96%);
  backdrop-filter: blur(8px);
}

.shell-embed-transition-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  min-width: 240px;
  padding: 32px 36px;
  text-align: center;
  background: hsl(var(--card) / 92%);
  border: 1px solid hsl(var(--border) / 78%);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgb(2 4 12 / 28%);
}

.shell-embed-transition-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: hsl(var(--primary));
}

.shell-embed-transition-icon :deep(svg) {
  width: 48px;
  height: 48px;
}

.shell-embed-transition-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border) / 60%);
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: shell-embed-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.shell-embed-transition-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.shell-embed-transition-hint {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.shell-embed-transition-enter-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 0.25s ease;
}

.shell-embed-transition-leave-active {
  transition:
    opacity 0.3s ease-in,
    backdrop-filter 0.3s ease;
}

.shell-embed-transition-enter-from {
  opacity: 0;
  backdrop-filter: blur(0);
}

.shell-embed-transition-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
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
