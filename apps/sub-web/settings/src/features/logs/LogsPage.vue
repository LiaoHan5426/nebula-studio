<script setup lang="ts">
import type { LogRecord } from '@/shared/api/system';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaInput,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { logsApi } from '@/shared/api/system';
import EntityListPage from '@/shared/components/EntityListPage.vue';
import { isApiSuccess } from '@/shared/types';

type LogTab = 'audit' | 'login' | 'operations';

const tabs: { key: LogTab; label: string }[] = [
  { key: 'login', label: '登录日志' },
  { key: 'operations', label: '操作日志' },
  { key: 'audit', label: '审计日志' },
];

const activeTab = ref<LogTab>('login');
const records = ref<LogRecord[]>([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const keyword = ref('');
const level = ref('');
const selected = ref<LogRecord>();
const detailOpen = ref(false);
const router = useRouter();

const pageTitle = computed(
  () => tabs.find((tab) => tab.key === activeTab.value)?.label ?? '日志管理',
);
const visibleRecords = computed(() =>
  records.value.filter(
    (record) =>
      !level.value ||
      String(record.level ?? record.operationType ?? '') === level.value,
  ),
);

onMounted(() => {
  void loadLogs();
});

watch(activeTab, () => {
  page.value = 1;
  keyword.value = '';
  void loadLogs();
});

async function loadLogs() {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      size: 20,
    };
    let response;
    if (activeTab.value === 'login') {
      response = await logsApi.loginPage({
        ...params,
        username: keyword.value.trim() || undefined,
      });
    } else if (activeTab.value === 'operations') {
      response = await logsApi.operationsPage({
        ...params,
        module: keyword.value.trim() || undefined,
      });
    } else {
      response = await logsApi.auditPage({
        ...params,
        entityName: keyword.value.trim() || undefined,
      });
    }
    if (isApiSuccess(response)) {
      records.value = response.data.records ?? [];
      total.value = response.data.total ?? 0;
    }
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  void loadLogs();
}

function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
  void loadLogs();
}

function nextPage() {
  if (page.value * 20 >= total.value) return;
  page.value += 1;
  void loadLogs();
}

function openDetails(record: LogRecord) {
  selected.value = record;
  detailOpen.value = true;
}

function exportLogs() {
  const columns = [
    'id',
    'username',
    'level',
    'module',
    'operationType',
    'entityName',
    'message',
    'createTime',
  ];
  const escape = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [
    columns.join(','),
    ...visibleRecords.value.map((record) =>
      columns.map((column) => escape(record[column])).join(','),
    ),
  ].join('\n');
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `nebula-${activeTab.value}-logs.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function openRelatedEntity() {
  const entity = String(selected.value?.entityName ?? '').toLowerCase();
  if (entity.includes('user')) void router.push('/organization/users');
  else if (entity.includes('role')) void router.push('/access/roles');
  else if (entity.includes('app')) void router.push('/platform/apps');
}
</script>

<template>
  <EntityListPage
    eyebrow="Audit"
    :title="pageTitle"
    description="检索登录、操作与审计日志，支持导出与关联实体跳转。"
    :loading="loading"
    :empty="!loading && visibleRecords.length === 0"
    empty-title="暂无日志"
    empty-description="调整筛选条件或稍后再试。"
    :result-summary="`共 ${total} 条记录`"
    :detail-open="detailOpen"
    :detail-title="String(selected?.username ?? selected?.module ?? '日志详情')"
    :detail-subtitle="String(selected?.operationType ?? selected?.level ?? '')"
    @update:detail-open="detailOpen = $event"
  >
    <template #filters>
      <div class="page__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="page__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <NebulaInput
        v-model="keyword"
        type="text"
        class="page__search"
        :placeholder="
          activeTab === 'login'
            ? '搜索用户名'
            : activeTab === 'operations'
              ? '搜索模块'
              : '搜索实体'
        "
        @keyup.enter="applyFilters"
      />
      <NebulaSelect
        v-model="level"
        :options="[
          { label: '全部级别', value: '' },
          { label: 'INFO', value: 'INFO' },
          { label: 'WARN', value: 'WARN' },
          { label: 'ERROR', value: 'ERROR' },
        ]"
      />
    </template>
    <template #filterActions>
      <NebulaButton variant="outline" @click="applyFilters">筛选</NebulaButton>
      <NebulaButton variant="outline" @click="exportLogs">
导出 CSV
</NebulaButton>
    </template>

    <NebulaTable
      :data="visibleRecords"
      :loading="loading"
      row-key="id"
      :empty-text="`暂无${pageTitle}`"
    >
      <NebulaTableColumn
        v-if="activeTab === 'login'"
        field="username"
        title="用户名"
        min-width="120"
      />
      <NebulaTableColumn
        v-if="activeTab === 'operations'"
        field="level"
        title="级别"
        width="90"
      />
      <NebulaTableColumn
        v-if="activeTab === 'operations'"
        field="module"
        title="模块"
        min-width="120"
      />
      <NebulaTableColumn
        v-if="activeTab === 'audit'"
        field="operationType"
        title="操作类型"
        min-width="120"
      />
      <NebulaTableColumn
        v-if="activeTab === 'audit'"
        field="entityName"
        title="实体"
        min-width="120"
      />
      <NebulaTableColumn field="message" title="内容" min-width="220" />
      <NebulaTableColumn field="createTime" title="时间" min-width="160" />
      <NebulaTableColumn title="操作" width="90">
        <template #default="{ row }">
          <NebulaButton variant="ghost" @click="openDetails(row)">
            详情
          </NebulaButton>
        </template>
      </NebulaTableColumn>
    </NebulaTable>

    <template #footer>
      <div class="page__pager">
        <span>共 {{ total }} 条</span>
        <NebulaButton
          variant="secondary"
          :disabled="page <= 1"
          @click="prevPage"
        >
          上一页
        </NebulaButton>
        <span>第 {{ page }} 页</span>
        <NebulaButton
          variant="secondary"
          :disabled="page * 20 >= total"
          @click="nextPage"
        >
          下一页
        </NebulaButton>
      </div>
    </template>

    <template #detail>
      <dl v-if="selected" class="log-detail">
        <div v-for="(value, key) in selected" :key="String(key)">
          <dt>{{ key }}</dt>
          <dd>{{ value ?? '—' }}</dd>
        </div>
      </dl>
    </template>
    <template #detailFooter>
      <NebulaButton
        v-if="selected?.entityName"
        variant="outline"
        @click="openRelatedEntity"
      >
        打开关联实体
      </NebulaButton>
    </template>
  </EntityListPage>
</template>

<style lang="scss" scoped>
.page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page__tab {
  padding: 8px 14px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 999px;
}

.page__tab.is-active {
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--primary) / 14%);
  border-color: hsl(var(--primary) / 35%);
}

.page__search {
  min-width: 220px;
}

.page__pager {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.log-detail {
  display: grid;
  margin: 0 0 var(--space-4);
}

.log-detail div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: var(--space-3);
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.log-detail dt {
  color: hsl(var(--muted-foreground));
}

.log-detail dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
