<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/shared/api/consoleApi';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

const logs = ref<Array<Record<string, unknown>>>([]);
const loading = ref(false);
const dateRange = ref<[string, string] | null>(null);
const { currentTenantId } = useTenant();

onMounted(() => {
  void loadLogs();
});

async function loadLogs() {
  loading.value = true;
  try {
    const response = await monitorApi.callLogs({
      tenantId: currentTenantId.value,
      pageSize: 50,
    });
    if (isApiSuccess(response)) {
      logs.value = (response.data.items ?? []).map((row) => ({
        logId: row.logId ?? row.log_id,
        tenantId: row.tenantId ?? row.tenant_id,
        interfaceId: row.interfaceId ?? row.interface_id,
        interfaceName: row.interfaceName ?? row.interface_name ?? '-',
        durationMs: row.durationMs ?? row.duration_ms ?? '-',
        status: row.status,
        errorMessage: row.errorMessage ?? row.error_message ?? '-',
        createdAt: row.createdAt ?? row.created_at,
      }));
    }
  } finally {
    loading.value = false;
  }
}

function statusVariant(status: unknown) {
  const value = String(status ?? '').toUpperCase();
  if (value === 'SUCCESS' || value === 'OK') return 'success';
  if (value === 'FAILED' || value === 'ERROR') return 'default';
  return 'warning';
}

function formatTime(value: unknown) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}
</script>

<template>
  <div class="log-query-page">
    <header class="log-query-page__header">
      <div>
        <h2 class="log-query-page__title">日志查询</h2>
        <p class="log-query-page__desc">查询服务调用日志与错误信息</p>
      </div>
      <div class="log-query-page__actions">
        <NebulaDatePicker v-model="dateRange" type="datetimerange" />
        <NebulaButton variant="secondary" @click="loadLogs">查询</NebulaButton>
      </div>
    </header>

    <div class="log-query-page__table-wrap">
      <NebulaTable
        :data="logs"
        :loading="loading"
        :scroll-x="{ enabled: false }"
        row-key="logId"
        class="log-query-page__table"
      >
        <NebulaTableColumn
          field="logId"
          title="日志 ID"
          min-width="160"
          show-overflow="tooltip"
        />
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
          min-width="120"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="durationMs" title="耗时(ms)" width="100" />
        <NebulaTableColumn field="status" title="状态" width="100">
          <template #default="{ row }">
            <NebulaTag :variant="statusVariant(row.status)">
              {{ row.status }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn
          field="errorMessage"
          title="错误信息"
          min-width="140"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="createdAt" title="执行时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>
  </div>
</template>

<style scoped>
.log-query-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.log-query-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-query-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.log-query-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.log-query-page__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.log-query-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-query-page__table {
  width: 100%;
}
</style>
