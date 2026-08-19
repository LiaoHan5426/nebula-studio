<script setup lang="ts">
import type { NebulaThemeMode } from '../../types/layout';

import { ref } from 'vue';

import { NebulaDrawer } from '@nebula-studio/nebula-ui';

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
</script>

<template>
  <NebulaDrawer
    class="nebula-prefs-drawer"
    :open="props.open"
    title="偏好设置"
    subtitle="自定义偏好设置 & 实时预览"
    width="400px"
    @update:open="emit('update:open', $event)"
  >
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
  </NebulaDrawer>
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
