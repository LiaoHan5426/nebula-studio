<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaFilterBar,
  NebulaInput,
  NebulaPageHeader,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

const { t } = useI18n();
const keyword = ref('');
const preview = ref<'empty' | 'error' | 'forbidden' | 'list'>('list');
const rows = [
  { id: '1', name: 'Orders API', status: 'ready' },
  { id: '2', name: 'Billing table', status: 'ready' },
];
</script>

<template>
  <div class="catalog-page">
    <NebulaPageHeader
      :title="t('design.patterns.title')"
      :description="t('design.patterns.description')"
    >
      <template #actions>
        <NebulaButton variant="primary">
{{
          t('design.patterns.header')
        }}
</NebulaButton>
      </template>
    </NebulaPageHeader>

    <section>
      <h2>{{ t('design.patterns.filter') }}</h2>
      <NebulaFilterBar result-summary="2">
        <NebulaInput v-model="keyword" />
      </NebulaFilterBar>
    </section>

    <section>
      <h2>{{ t('design.patterns.list') }}</h2>
      <div class="row">
        <NebulaButton
          v-for="state in ['list', 'empty', 'error', 'forbidden'] as const"
          :key="state"
          :variant="preview === state ? 'primary' : 'ghost'"
          @click="preview = state"
        >
          {{ t(`design.patterns.${state === 'list' ? 'list' : state}`) }}
        </NebulaButton>
      </div>
      <NebulaTable v-if="preview === 'list'" :data="rows" row-key="id">
        <NebulaTableColumn field="name" title="Name" />
        <NebulaTableColumn field="status" title="Status" />
      </NebulaTable>
      <NebulaEmptyState
        v-else-if="preview === 'empty'"
        :title="t('design.patterns.emptyTitle')"
        :description="t('design.patterns.emptyBody')"
      />
      <NebulaEmptyState
        v-else-if="preview === 'error'"
        :title="t('design.patterns.errorTitle')"
        :description="t('design.patterns.errorBody')"
      />
      <NebulaEmptyState
        v-else
        :title="t('design.patterns.forbiddenTitle')"
        :description="t('design.patterns.forbiddenBody')"
      />
    </section>
  </div>
</template>

<style scoped>
.catalog-page {
  display: grid;
  gap: var(--space-5);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
