<script setup lang="ts">
import {
  NebulaDrawer,
  NebulaEmptyState,
  NebulaFilterBar,
  NebulaPageHeader,
} from '@nebula-studio/nebula-ui';

withDefaults(
  defineProps<{
    description: string;
    detailOpen?: boolean;
    detailSubtitle?: string;
    detailTitle?: string;
    empty?: boolean;
    emptyDescription?: string;
    emptyTitle?: string;
    eyebrow?: string;
    loading?: boolean;
    resultSummary?: string;
    title: string;
  }>(),
  {
    eyebrow: 'Management',
    resultSummary: '',
    loading: false,
    empty: false,
    emptyTitle: '暂无数据',
    emptyDescription: '调整筛选条件或创建第一个对象。',
    detailOpen: false,
    detailTitle: '详情',
    detailSubtitle: '',
  },
);

defineEmits<{
  'update:detailOpen': [value: boolean];
}>();
</script>

<template>
  <main class="entity-list-page">
    <NebulaPageHeader
      :eyebrow="eyebrow"
      :title="title"
      :description="description"
    >
      <template #actions><slot name="actions"></slot></template>
    </NebulaPageHeader>

    <NebulaFilterBar
      v-if="$slots.filters || resultSummary"
      :result-summary="resultSummary"
    >
      <slot name="filters"></slot>
      <template v-if="$slots.filterActions" #actions>
        <slot name="filterActions"></slot>
      </template>
    </NebulaFilterBar>

    <div v-if="loading" class="entity-list-page__loading" role="status">
      正在加载…
    </div>
    <NebulaEmptyState
      v-else-if="empty"
      :title="emptyTitle"
      :description="emptyDescription"
    >
      <slot name="emptyAction"></slot>
    </NebulaEmptyState>
    <slot v-else></slot>

    <slot name="footer"></slot>

    <NebulaDrawer
      :open="detailOpen"
      :title="detailTitle"
      :subtitle="detailSubtitle"
      width="440px"
      @update:open="$emit('update:detailOpen', $event)"
    >
      <slot name="detail"></slot>
      <template v-if="$slots.detailFooter" #footer>
        <slot name="detailFooter"></slot>
      </template>
    </NebulaDrawer>

    <slot name="dialogs"></slot>
  </main>
</template>

<style scoped>
.entity-list-page {
  display: grid;
  gap: var(--space-4);
}

.entity-list-page__loading {
  min-height: 240px;
  padding: var(--space-6);
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: hsl(var(--muted) / 35%);
  border-radius: var(--radius-lg);
}
</style>
