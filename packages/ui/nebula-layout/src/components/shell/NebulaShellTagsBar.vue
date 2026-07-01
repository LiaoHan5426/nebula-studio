<script setup lang="ts">
import { NebulaIconButton } from '@nebula-studio/nebula-ui';
import { computed, ref } from 'vue';

import type { ShellTagItem } from '../../types/layout';

const props = defineProps<{
  tags: ShellTagItem[];
  activeKey: string;
  contentFullscreen?: boolean;
}>();

const emit = defineEmits<{
  activate: [key: string];
  close: [key: string];
  closeLeft: [];
  closeRight: [];
  closeOthers: [];
  closeAll: [];
  refresh: [];
  fullscreen: [];
}>();

const menuOpen = ref(false);

const activeIndex = computed(() =>
  props.tags.findIndex((tag) => tag.key === props.activeKey),
);

const canCloseLeft = computed(() => activeIndex.value > 1);
const canCloseRight = computed(
  () => activeIndex.value >= 0 && activeIndex.value < props.tags.length - 1,
);
const canCloseOthers = computed(() =>
  props.tags.some(
    (tag) =>
      tag.key !== props.activeKey &&
      tag.closable !== false &&
      tag.key !== 'workspace',
  ),
);
const canCloseAll = computed(() =>
  props.tags.some((tag) => tag.closable !== false && tag.key !== 'workspace'),
);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function runAndClose(fn: () => void) {
  fn();
  menuOpen.value = false;
}
</script>

<template>
  <div class="nebula-shell-tags">
    <div
      class="nebula-shell-tags__scroll"
      role="tablist"
      aria-label="已打开页面"
    >
      <button
        v-for="tag in tags"
        :key="tag.key"
        type="button"
        role="tab"
        class="nebula-shell-tags__tab"
        :class="{
          'is-active': tag.key === activeKey,
          'is-closable': tag.closable !== false && tag.key !== 'workspace',
        }"
        :aria-selected="tag.key === activeKey"
        @click="emit('activate', tag.key)"
      >
        <svg
          v-if="tag.icon === 'home' || tag.key === 'workspace'"
          class="nebula-shell-tags__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"
          />
        </svg>
        <span class="nebula-shell-tags__label">{{ tag.label }}</span>
        <span
          v-if="tag.closable !== false && tag.key !== 'workspace'"
          class="nebula-shell-tags__close"
          role="button"
          tabindex="-1"
          title="关闭"
          aria-label="关闭"
          @click.stop="emit('close', tag.key)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </button>
    </div>

    <div class="nebula-shell-tags__actions">
      <div
        class="nebula-shell-tags__menu-wrap"
        :class="{ 'is-open': menuOpen }"
      >
        <NebulaIconButton
          title="标签操作"
          aria-label="标签操作"
          @click.stop="toggleMenu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="16"
            height="16"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </NebulaIconButton>
        <div v-show="menuOpen" class="nebula-shell-tags__menu" role="menu">
          <button
            type="button"
            :disabled="!canCloseLeft"
            @click="runAndClose(() => emit('closeLeft'))"
          >
            关闭左侧
          </button>
          <button
            type="button"
            :disabled="!canCloseRight"
            @click="runAndClose(() => emit('closeRight'))"
          >
            关闭右侧
          </button>
          <button
            type="button"
            :disabled="!canCloseOthers"
            @click="runAndClose(() => emit('closeOthers'))"
          >
            关闭其它
          </button>
          <button
            type="button"
            :disabled="!canCloseAll"
            @click="runAndClose(() => emit('closeAll'))"
          >
            全部关闭
          </button>
        </div>
      </div>
      <NebulaIconButton
        title="刷新当前页"
        aria-label="刷新当前页"
        @click="emit('refresh')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path
            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          />
        </svg>
      </NebulaIconButton>
      <NebulaIconButton
        :title="contentFullscreen ? '退出内容全屏' : '内容区全屏'"
        :aria-label="contentFullscreen ? '退出内容全屏' : '内容区全屏'"
        @click="emit('fullscreen')"
      >
        <svg
          v-if="!contentFullscreen"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <polyline points="21 15 21 21 15 21" />
          <polyline points="3 9 3 3 9 3" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <polyline points="14 10 21 3" />
          <polyline points="3 21 10 14" />
        </svg>
      </NebulaIconButton>
    </div>
  </div>
</template>

<style scoped>
.nebula-shell-tags {
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  height: var(--layout-tags-height);
  background: hsl(var(--background-deep) / 88%);
  border-bottom: 1px solid hsl(var(--border) / 75%);
}

.nebula-shell-tags__scroll {
  display: flex;
  flex: 1;
  gap: 4px;
  align-items: stretch;
  min-width: 0;
  padding: 0 8px;
  overflow-x: auto;
}

.nebula-shell-tags__tab {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  max-width: 180px;
  padding: 0 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
}

.nebula-shell-tags__tab.is-active {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 45%);
  border-bottom-color: hsl(var(--primary));
}

.nebula-shell-tags__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.nebula-shell-tags__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nebula-shell-tags__close {
  display: inline-flex;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.nebula-shell-tags__close:hover {
  opacity: 1;
}

.nebula-shell-tags__close svg {
  width: 12px;
  height: 12px;
}

.nebula-shell-tags__actions {
  display: flex;
  gap: 2px;
  align-items: center;
  padding: 0 8px;
  border-left: 1px solid hsl(var(--border) / 70%);
}

.nebula-shell-tags__menu-wrap {
  position: relative;
}

.nebula-shell-tags__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  display: grid;
  gap: 2px;
  min-width: 120px;
  padding: 6px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
}

.nebula-shell-tags__menu button {
  padding: 8px 10px;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
}

.nebula-shell-tags__menu button:hover:not(:disabled) {
  background: hsl(var(--muted) / 70%);
}

.nebula-shell-tags__menu button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
