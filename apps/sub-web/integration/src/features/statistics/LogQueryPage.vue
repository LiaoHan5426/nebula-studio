<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  NebulaButton,
  NebulaDatePicker,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { callLogsQueryOptions } from '@/features/monitor/queryOptions';
import { useTenant } from '@/shared/composables/useTenant';
import { useQuery } from '@tanstack/vue-query';

const dateRange = ref<[string, string] | null>(null);
const { currentTenantId } = useTenant();
const logsQuery = useQuery(() =>
  callLogsQueryOptions(currentTenantId.value || undefined),
);
const logs = computed(() => logsQuery.data.value ?? []);
const loading = computed(() => logsQuery.isPending.value);

async function loadLogs() {
  await logsQuery.refetch();
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
