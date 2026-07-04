<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
import type { NebulaThemeMode } from '../../types/layout';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import AppearanceTab from './AppearanceTab.vue';
import LayoutTab from './LayoutTab.vue';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    theme?: NebulaThemeMode;
  }>(),
  {
    open: false,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:theme': [value: NebulaThemeMode];
}>();

const activeTab = ref<'appearance' | 'layout'>('appearance');

function close() {
  emit('update:open', false);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close();
}

watch(
  () => props.open,
  (open) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
  },
  { immediate: true },
);

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="nebula-drawer-root nebula-prefs-drawer">
      <div class="nebula-drawer__overlay" @click="close" />
      <aside
        class="nebula-drawer nebula-drawer--right"
        role="dialog"
        aria-modal="true"
        aria-label="偏好设置"
        style="width: 400px"
      >
        <header class="nebula-drawer__header">
          <div class="nebula-drawer__titles">
            <h2 class="nebula-drawer__title">偏好设置</h2>
            <p class="nebula-drawer__subtitle">自定义偏好设置 &amp; 实时预览</p>
          </div>
          <NebulaButton
            icon
            variant="ghost"
            class="nebula-drawer__close"
            title="关闭"
            aria-label="关闭"
            @click="close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="18"
              height="18"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </NebulaButton>
        </header>

        <div class="nebula-drawer__body">
          <div class="prefs-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="prefs-tabs__btn"
              :class="{ 'is-active': activeTab === 'appearance' }"
              @click="activeTab = 'appearance'"
            >
              外观
            </button>
            <button
              type="button"
              role="tab"
              class="prefs-tabs__btn"
              :class="{ 'is-active': activeTab === 'layout' }"
              @click="activeTab = 'layout'"
            >
              布局
            </button>
          </div>

          <AppearanceTab
            v-if="activeTab === 'appearance'"
            :theme="theme"
            @update:theme="emit('update:theme', $event)"
          />
          <LayoutTab v-else />
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.prefs-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 16px;
  background: hsl(var(--muted) / 45%);
  border-radius: 10px;
}

.prefs-tabs__btn {
  flex: 1;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
}

.prefs-tabs__btn.is-active {
  color: hsl(var(--primary));
  background: hsl(var(--card));
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}
</style>
