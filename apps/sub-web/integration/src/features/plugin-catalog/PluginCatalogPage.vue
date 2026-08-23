<script setup lang="ts">
import type { PluginCatalogViewModel } from './types';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaDrawer,
  NebulaEmptyState,
  NebulaFilterBar,
  NebulaInput,
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';
import { storeToRefs } from '@nebula-studio/state';

import { pluginApi } from '@/features/plugin/api';
import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';
import { useIntegrationUiStore } from '@/shared/state/portalStore';
import { useQuery } from '@tanstack/vue-query';

import PluginSchemaForm from './PluginSchemaForm.vue';
import { pluginCatalogQueryOptions } from './queryOptions';

const { t } = useI18n();
const catalogQuery = useQuery(() => pluginCatalogQueryOptions());
const ui = useIntegrationUiStore();
const { pluginKeyword: keyword, pluginCategory: category } = storeToRefs(ui);
const selected = ref<PluginCatalogViewModel>();
const drawerOpen = ref(false);
const config = ref<Record<string, unknown>>({});
const installingId = ref('');

const items = computed(() => catalogQuery.data.value ?? []);
const loading = computed(() => catalogQuery.isPending.value);
const error = computed(() =>
  catalogQuery.error.value
    ? t(errorMessageKey(mapIntegrationErrorCode(catalogQuery.error.value)))
    : '',
);

const categories = computed(() => [
  { label: t('plugins.filter.all'), value: '' },
  ...Array.from(new Set(items.value.map((item) => item.category)))
    .toSorted()
    .map((value) => ({ label: value, value })),
]);
const visibleItems = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return items.value.filter(
    (item) =>
      (!category.value || item.category === category.value) &&
      (!query ||
        [item.name, item.id, item.connectorId, ...item.capabilities]
          .join(' ')
          .toLowerCase()
          .includes(query)),
  );
});

function load(): void {
  void catalogQuery.refetch();
}

function openDetails(item: PluginCatalogViewModel): void {
  selected.value = item;
  config.value = Object.fromEntries(
    item.configFields.map((field) => [field.key, field.defaultValue ?? '']),
  );
  drawerOpen.value = true;
}

async function install(item: PluginCatalogViewModel): Promise<void> {
  installingId.value = item.id;
  try {
    await pluginApi.install(item.id);
  } finally {
    installingId.value = '';
  }
}
</script>

<template>
  <main class="plugin-catalog-page">
    <NebulaPageHeader
      :eyebrow="t('plugins.eyebrow')"
      :title="t('plugins.title')"
      :description="t('plugins.description')"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="load">
          {{ t('plugins.refresh') }}
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <NebulaFilterBar
      :result-summary="t('plugins.resultSummary', { n: visibleItems.length })"
    >
      <NebulaInput
        v-model="keyword"
        :placeholder="t('plugins.searchPlaceholder')"
        :aria-label="t('plugins.searchAria')"
      />
      <NebulaSelect
        v-model="category"
        :options="categories"
        :aria-label="t('plugins.categoryAria')"
      />
    </NebulaFilterBar>

    <div v-if="loading" class="plugin-grid">
      <div v-for="index in 6" :key="index" class="plugin-skeleton"></div>
    </div>
    <NebulaEmptyState
      v-else-if="error"
      :title="t('plugins.loadFailed')"
      :description="error"
    >
      <NebulaButton @click="load">{{ t('common.reload') }}</NebulaButton>
    </NebulaEmptyState>
    <NebulaEmptyState
      v-else-if="visibleItems.length === 0"
      :title="t('plugins.emptyTitle')"
      :description="t('plugins.emptyBody')"
    />
    <section v-else class="plugin-grid">
      <article v-for="item in visibleItems" :key="item.id" class="plugin-card">
        <header>
          <span class="plugin-mark">P</span>
          <div>
            <span class="plugin-category">{{ item.category }}</span>
            <h2>{{ item.name }}</h2>
          </div>
          <NebulaTag>v{{ item.version }}</NebulaTag>
        </header>
        <p>{{ item.description }}</p>
        <div class="plugin-tags">
          <NebulaTag v-for="capability in item.capabilities" :key="capability">
            {{ capability }}
          </NebulaTag>
          <NebulaTag v-if="item.nodeKind">{{ item.nodeKind }}</NebulaTag>
        </div>
        <footer>
          <span>{{ item.connectorId || item.id }}</span>
          <NebulaButton variant="outline" size="sm" @click="openDetails(item)">
            {{ t('plugins.viewConfig') }}
          </NebulaButton>
          <NebulaButton
            size="sm"
            :disabled="installingId === item.id"
            @click="install(item)"
          >
            {{
              installingId === item.id
                ? t('plugins.installing')
                : t('plugins.install')
            }}
          </NebulaButton>
        </footer>
      </article>
    </section>

    <NebulaDrawer
      v-model:open="drawerOpen"
      :title="selected?.name || t('plugins.detailFallback')"
      :subtitle="selected ? `${selected.id} · v${selected.version}` : ''"
      width="480px"
    >
      <div v-if="selected" class="plugin-detail">
        <section>
          <h3>{{ t('plugins.identity') }}</h3>
          <dl>
            <div>
              <dt>{{ t('plugins.pluginId') }}</dt>
              <dd>{{ selected.id }}</dd>
            </div>
            <div>
              <dt>{{ t('plugins.category') }}</dt>
              <dd>{{ selected.category }}</dd>
            </div>
            <div>
              <dt>Connector</dt>
              <dd>{{ selected.connectorId || t('plugins.undeclared') }}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>{{ t('plugins.configPreview') }}</h3>
          <PluginSchemaForm v-model="config" :fields="selected.configFields" />
        </section>
        <section>
          <h3>{{ t('plugins.submitPreview') }}</h3>
          <pre>{{ JSON.stringify(config, null, 2) }}</pre>
        </section>
      </div>
    </NebulaDrawer>
  </main>
</template>

<style scoped>
.plugin-catalog-page {
  display: grid;
  gap: var(--space-5);
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.plugin-card {
  display: grid;
  gap: var(--space-4);
  min-height: 250px;
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.plugin-card header,
.plugin-card footer,
.plugin-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.plugin-card header > div {
  flex: 1;
}

.plugin-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-weight: 900;
  color: white;
  background: hsl(var(--primary));
  border-radius: 12px;
}

.plugin-category {
  font-size: 10px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.plugin-card h2 {
  margin: 3px 0 0;
  font-size: 17px;
}

.plugin-card p {
  margin: 0;
  line-height: 1.65;
  color: hsl(var(--muted-foreground));
}

.plugin-card footer {
  padding-top: var(--space-3);
  margin-top: auto;
  border-top: 1px solid hsl(var(--border));
}

.plugin-card footer > span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.plugin-skeleton {
  min-height: 250px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

.plugin-detail {
  display: grid;
  gap: var(--space-5);
}

.plugin-detail h3 {
  margin: 0 0 var(--space-3);
}

.plugin-detail dl {
  margin: 0;
}

.plugin-detail dl div {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: var(--space-3);
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.plugin-detail dt {
  color: hsl(var(--muted-foreground));
}

.plugin-detail dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.plugin-detail pre {
  padding: var(--space-3);
  overflow: auto;
  font-size: 12px;
  background: hsl(var(--muted) / 50%);
  border-radius: var(--radius-md);
}

@media (width <= 900px) {
  .plugin-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 620px) {
  .plugin-grid {
    grid-template-columns: 1fr;
  }
}
</style>
