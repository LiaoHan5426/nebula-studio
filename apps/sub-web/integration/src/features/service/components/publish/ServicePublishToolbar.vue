<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';

import type { ServiceTab } from '../../publish/types';
import { SERVICE_TAB_LABELS } from '../../publish/types';

defineProps<{
  activeTab: ServiceTab;
  totalCount: number;
  atomicCount: number;
  compositeCount: number;
}>();

const emit = defineEmits<{
  'update:activeTab': [tab: ServiceTab];
  createComposite: [];
  refresh: [];
}>();

function tabCount(
  tab: ServiceTab,
  totalCount: number,
  atomicCount: number,
  compositeCount: number,
): number {
  if (tab === 'all') return totalCount;
  if (tab === 'atomic') return atomicCount;
  return compositeCount;
}
</script>

<template>
  <div class="page__toolbar service-publish-page__toolbar">
    <div class="service-publish-page__tabs" role="tablist">
      <button
        v-for="tab in ['all', 'atomic', 'composite'] as ServiceTab[]"
        :key="tab"
        type="button"
        role="tab"
        class="service-publish-page__tab"
        :class="{ 'service-publish-page__tab--active': activeTab === tab }"
        @click="emit('update:activeTab', tab)"
      >
        {{ SERVICE_TAB_LABELS[tab] }}
        ({{ tabCount(tab, totalCount, atomicCount, compositeCount) }})
      </button>
    </div>
    <div class="service-publish-page__actions">
      <NebulaButton variant="primary" @click="emit('createComposite')">
        新建组合服务
      </NebulaButton>
      <NebulaButton variant="outline" @click="emit('refresh')"
        >刷新</NebulaButton
      >
    </div>
  </div>
</template>

<style scoped>
.service-publish-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.service-publish-page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-publish-page__tab {
  padding: 6px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.service-publish-page__tab--active {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.service-publish-page__actions {
  display: flex;
  gap: 8px;
}
</style>
