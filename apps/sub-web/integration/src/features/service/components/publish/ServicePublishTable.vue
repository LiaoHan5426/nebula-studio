<script setup lang="ts">
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import type { ApiInterface } from '@/shared/types';
import { InterfaceType } from '@/shared/types';

import {
  canSubmitPublish,
  defaultOrchestrationType,
  formatTime,
  isDagComposite,
  isPendingReview,
  isPublished,
  serviceTypeLabel,
  statusLabel,
  statusVariant,
} from '../../publish/mappers';

defineProps<{
  services: ApiInterface[];
  loading: boolean;
  isPlatformAdmin: boolean;
}>();

const emit = defineEmits<{
  approve: [item: ApiInterface];
  reject: [item: ApiInterface];
  publish: [item: ApiInterface];
  offline: [item: ApiInterface];
  delete: [item: ApiInterface];
  editComposite: [item: ApiInterface];
}>();
</script>

<template>
  <NebulaTable
    :data="services"
    :loading="loading"
    :scroll-x="{ enabled: false }"
    row-key="interfaceId"
  >
    <NebulaTableColumn
      field="interfaceName"
      title="服务名称"
      min-width="140"
      show-overflow="tooltip"
    />
    <NebulaTableColumn
      field="endpointUri"
      title="端点"
      min-width="150"
      show-overflow="tooltip"
    />
    <NebulaTableColumn title="类型" width="100">
      <template #default="{ row }">
        {{ serviceTypeLabel(row) }}
      </template>
    </NebulaTableColumn>
    <NebulaTableColumn title="编排" width="100">
      <template #default="{ row }">
        {{ defaultOrchestrationType(row) }}
      </template>
    </NebulaTableColumn>
    <NebulaTableColumn field="status" title="发布状态" width="100">
      <template #default="{ row }">
        <NebulaTag :variant="statusVariant(row.status)">
          {{ statusLabel(row.status) }}
        </NebulaTag>
      </template>
    </NebulaTableColumn>
    <NebulaTableColumn field="createdAt" title="注册时间" width="150">
      <template #default="{ row }">
        {{ formatTime(row.createdAt) }}
      </template>
    </NebulaTableColumn>
    <NebulaTableColumn title="操作" width="300">
      <template #default="{ row }">
        <div class="row-actions">
          <NebulaButton
            v-if="isPlatformAdmin && isPendingReview(row)"
            variant="outline"
            @click="emit('approve', row)"
          >
            通过
          </NebulaButton>
          <NebulaButton
            v-if="isPlatformAdmin && isPendingReview(row)"
            variant="outline"
            @click="emit('reject', row)"
          >
            驳回
          </NebulaButton>
          <NebulaButton
            v-if="!isPlatformAdmin && canSubmitPublish(row)"
            variant="outline"
            @click="emit('publish', row)"
          >
            提交审批
          </NebulaButton>
          <NebulaButton
            v-if="isPlatformAdmin && canSubmitPublish(row)"
            variant="outline"
            @click="emit('publish', row)"
          >
            发布
          </NebulaButton>
          <NebulaButton
            v-if="isPublished(row)"
            variant="outline"
            @click="emit('offline', row)"
          >
            下线
          </NebulaButton>
          <NebulaButton
            v-if="row.interfaceType === InterfaceType.COMPOSITE"
            variant="outline"
            @click="emit('editComposite', row)"
          >
            {{ isDagComposite(row) ? '设计 DAG' : '设计流程' }}
          </NebulaButton>
          <NebulaButton variant="outline" @click="emit('delete', row)">
            删除
          </NebulaButton>
        </div>
      </template>
    </NebulaTableColumn>
  </NebulaTable>
</template>
