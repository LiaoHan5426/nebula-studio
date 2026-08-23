<script setup lang="ts">
import { useI18n } from 'vue-i18n';

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
    emptyTitle: '',
    emptyDescription: '',
    detailOpen: false,
    detailTitle: '',
    detailSubtitle: '',
  },
);

defineEmits<{
  'update:detailOpen': [value: boolean];
}>();

const { t } = useI18n();

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
      {{ t('common.loading') }}
    </div>
    <NebulaEmptyState
      v-else-if="empty"
      :title="emptyTitle || t('common.empty')"
      :description="emptyDescription || t('common.emptyHint')"
    >
      <slot name="emptyAction"></slot>
    </NebulaEmptyState>
    <slot v-else></slot>

    <slot name="footer"></slot>

    <NebulaDrawer
      :open="detailOpen"
      :title="detailTitle || t('common.detail')"
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
