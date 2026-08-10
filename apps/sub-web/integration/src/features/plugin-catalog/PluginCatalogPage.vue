<script setup lang="ts">
import type { PluginCatalogViewModel } from './types';

import { computed, onMounted, ref } from 'vue';

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

import { pluginApi } from '@/features/plugin/api';

import { loadPluginCatalog } from './api';
import PluginSchemaForm from './PluginSchemaForm.vue';

const items = ref<PluginCatalogViewModel[]>([]);
const loading = ref(true);
const error = ref('');
const keyword = ref('');
const category = ref('');
const selected = ref<PluginCatalogViewModel>();
const drawerOpen = ref(false);
const config = ref<Record<string, unknown>>({});
const installingId = ref('');

const categories = computed(() => [
  { label: '全部分类', value: '' },
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

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    items.value = await loadPluginCatalog();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '插件目录加载失败';
  } finally {
    loading.value = false;
  }
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

onMounted(load);
</script>

<template>
  <main class="plugin-catalog-page">
    <NebulaPageHeader
      eyebrow="Platform extensions"
      title="插件目录"
      description="从真实目录发现插件能力，统一查看平台身份、Connector 配置 Schema 与 DAG 节点能力。"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="load">刷新目录</NebulaButton>
      </template>
    </NebulaPageHeader>

    <NebulaFilterBar :result-summary="`${visibleItems.length} 个插件`">
      <NebulaInput
        v-model="keyword"
        placeholder="搜索插件、Connector 或能力"
        aria-label="搜索插件目录"
      />
      <NebulaSelect
        v-model="category"
        :options="categories"
        aria-label="插件分类"
      />
    </NebulaFilterBar>

    <div v-if="loading" class="plugin-grid">
      <div v-for="index in 6" :key="index" class="plugin-skeleton"></div>
    </div>
    <NebulaEmptyState
      v-else-if="error"
      title="插件目录加载失败"
      :description="error"
    >
      <NebulaButton @click="load">重新加载</NebulaButton>
    </NebulaEmptyState>
    <NebulaEmptyState
      v-else-if="visibleItems.length === 0"
      title="没有匹配插件"
      description="尝试清除关键词或分类筛选。"
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
            查看配置
          </NebulaButton>
          <NebulaButton
            size="sm"
            :disabled="installingId === item.id"
            @click="install(item)"
          >
            {{ installingId === item.id ? '安装中…' : '安装' }}
          </NebulaButton>
        </footer>
      </article>
    </section>

    <NebulaDrawer
      v-model:open="drawerOpen"
      :title="selected?.name || '插件详情'"
      :subtitle="selected ? `${selected.id} · v${selected.version}` : ''"
      width="480px"
    >
      <div v-if="selected" class="plugin-detail">
        <section>
          <h3>平台身份</h3>
          <dl>
            <div>
              <dt>插件 ID</dt>
              <dd>{{ selected.id }}</dd>
            </div>
            <div>
              <dt>分类</dt>
              <dd>{{ selected.category }}</dd>
            </div>
            <div>
              <dt>Connector</dt>
              <dd>{{ selected.connectorId || '未声明' }}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>配置预览</h3>
          <PluginSchemaForm v-model="config" :fields="selected.configFields" />
        </section>
        <section>
          <h3>提交预览</h3>
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
