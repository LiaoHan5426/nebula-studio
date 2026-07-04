<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { logsApi } from '@/shared/api/system';
import type { LogRecord } from '@/shared/api/system';
import { isApiSuccess } from '@/shared/types';

type LogTab = 'login' | 'operations' | 'audit';

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

const pageTitle = computed(
  () => tabs.find((tab) => tab.key === activeTab.value)?.label ?? '日志管理',
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

function search() {
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
</script>

<template>
  <div class="page">
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

    <div class="page__actions">
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
        @keydown.enter="search"
      />
      <NebulaButton variant="secondary" @click="search">查询</NebulaButton>
      <NebulaButton variant="secondary" @click="loadLogs">刷新</NebulaButton>
    </div>

    <div class="page__table-wrap">
      <NebulaTable
        :data="records"
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
      </NebulaTable>
    </div>

    <div class="page__pager">
      <span>共 {{ total }} 条</span>
      <NebulaButton variant="secondary" :disabled="page <= 1" @click="prevPage">
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
  </div>
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
</style>
