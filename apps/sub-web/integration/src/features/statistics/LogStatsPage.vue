<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/shared/api/consoleApi';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

const stats = ref<Array<Record<string, unknown>>>([]);
const loading = ref(false);
const dateRange = ref<[string, string] | null>(null);
const { currentTenantId } = useTenant();

onMounted(() => {
  void loadStats();
});

async function loadStats() {
  loading.value = true;
  try {
    const response = await monitorApi.interfaceRanking(currentTenantId.value);
    if (isApiSuccess(response)) {
      stats.value = (response.data ?? []).map((row) => ({
        tenantId: currentTenantId.value,
        interfaceId: row.interfaceId ?? row.interface_id,
        interfaceName:
          row.interfaceName ?? row.interface_name ?? row.interfaceId,
        totalCalls: row.totalCalls ?? row.callCount ?? 0,
        successRate: row.successRate ?? row.success_rate ?? '-',
        avgDuration: row.avgDuration ?? row.avg_latency_ms ?? '-',
      }));
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="log-stats-page">
    <header class="log-stats-page__header">
      <div>
        <h2 class="log-stats-page__title">日志统计</h2>
        <p class="log-stats-page__desc">按服务汇总调用次数、成功率与平均耗时</p>
      </div>
      <div class="log-stats-page__actions">
        <NebulaDatePicker v-model="dateRange" type="datetimerange" />
        <NebulaButton variant="secondary" @click="loadStats">刷新</NebulaButton>
      </div>
    </header>

    <div class="log-stats-page__table-wrap">
      <NebulaTable
        :data="stats"
        :loading="loading"
        :scroll-x="{ enabled: false }"
        row-key="interfaceId"
        class="log-stats-page__table"
      >
        <NebulaTableColumn
          field="tenantId"
          title="租户 ID"
          width="120"
          show-overflow="tooltip"
        />
        <NebulaTableColumn
          field="interfaceId"
          title="服务 ID"
          min-width="140"
          show-overflow="tooltip"
        />
        <NebulaTableColumn
          field="interfaceName"
          title="服务名称"
          min-width="140"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="totalCalls" title="总调用次数" width="120" />
        <NebulaTableColumn field="successRate" title="成功率" width="100" />
        <NebulaTableColumn
          field="avgDuration"
          title="平均耗时(ms)"
          width="130"
        />
      </NebulaTable>
    </div>
  </div>
</template>

<style scoped>
.log-stats-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.log-stats-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-stats-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.log-stats-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.log-stats-page__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.log-stats-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-stats-page__table {
  width: 100%;
}
</style>
