<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/features/monitor/api';
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
  <div class="page">
    <NebulaPane title="日志查询" description="查询服务调用日志与错误信息">
      <div class="page__toolbar">
        <NebulaDatePicker v-model="dateRange" type="datetimerange" />
        <NebulaButton variant="primary" @click="loadLogs">查询</NebulaButton>
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="logs"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="logId"
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
    </NebulaPane>
  </div>
</template>
