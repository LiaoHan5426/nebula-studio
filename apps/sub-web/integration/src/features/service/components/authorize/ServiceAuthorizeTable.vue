<script setup lang="ts">
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { publishVariant } from '../../authorize/mappers';
import type { AuthorizeRow } from '../../authorize/types';

defineProps<{
  rows: AuthorizeRow[];
  loading: boolean;
  actingId: string | null;
}>();

const emit = defineEmits<{
  grant: [row: AuthorizeRow];
  revoke: [row: AuthorizeRow];
}>();
</script>

<template>
  <div class="service-authorize-page__table-wrap">
    <NebulaTable
      :data="rows"
      :loading="loading"
      :scroll-x="{ enabled: true }"
      row-key="serviceId"
      class="service-authorize-page__table"
    >
      <NebulaTableColumn
        field="serviceName"
        title="服务名称"
        min-width="120"
        show-overflow="tooltip"
      />
      <NebulaTableColumn field="serviceType" title="类型" width="90" />
      <NebulaTableColumn field="serviceSource" title="来源" width="90" />
      <NebulaTableColumn field="publishStatus" title="发布状态" width="100">
        <template #default="{ row }">
          <NebulaTag :variant="publishVariant(row.publishStatus)">
            {{ row.publishStatus }}
          </NebulaTag>
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn title="租户授权" width="100">
        <template #default="{ row }">
          <NebulaTag
            :variant="
              row.grantExpired || row.grantOutsideSchedule
                ? 'warning'
                : row.tenantAuthorized
                  ? 'success'
                  : 'default'
            "
          >
            {{
              row.wildcardAccess
                ? '全部'
                : row.grantExpired
                  ? '已过期'
                  : row.grantOutsideSchedule
                    ? '时段外'
                    : row.tenantAuthorized
                      ? '已授权'
                      : '未授权'
            }}
          </NebulaTag>
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn field="expiresLabel" title="有效期" width="140" />
      <NebulaTableColumn
        field="scheduleLabel"
        title="服务时间"
        min-width="150"
      />
      <NebulaTableColumn field="callsLabel" title="调用次数" width="100" />
      <NebulaTableColumn field="rateLabel" title="调用频率" width="120" />
      <NebulaTableColumn title="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <NebulaButton
              v-if="!row.wildcardAccess"
              variant="outline"
              :disabled="actingId === row.serviceId"
              @click="emit('grant', row)"
            >
              {{ row.tenantAuthorized ? '调整配额' : '授权' }}
            </NebulaButton>
            <NebulaButton
              v-if="row.tenantAuthorized && !row.wildcardAccess"
              variant="outline"
              :disabled="actingId === row.serviceId"
              @click="emit('revoke', row)"
            >
              撤销
            </NebulaButton>
            <span v-if="row.wildcardAccess" class="action-btns__hint"
              >通配 *</span
            >
          </div>
        </template>
      </NebulaTableColumn>
    </NebulaTable>
  </div>
</template>

<style scoped>
.service-authorize-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-authorize-page__table {
  width: 100%;
}

.action-btns {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.action-btns__hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
