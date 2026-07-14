<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { approvalApi } from '@/shared/api/consoleApi';
import type { GovernanceRequest } from '@/shared/types';

const requests = ref<GovernanceRequest[]>([]);
const loading = ref(false);

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审批',
  REVIEWING: '审核中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function statusVariant(status: string) {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'warning';
  if (status === 'PENDING' || status === 'REVIEWING') return 'info';
  return 'default';
}

function formatTime(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('zh-CN');
}

function canDecide(req: GovernanceRequest): boolean {
  return req.status === 'PENDING' || req.status === 'REVIEWING';
}

async function loadRequests() {
  loading.value = true;
  try {
    const tenantId = localStorage.getItem('tenant_id') || undefined;
    const res = await approvalApi.listRequests(tenantId);
    requests.value = res.data ?? [];
  } catch {
    requests.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleApprove(req: GovernanceRequest) {
  try {
    await approvalApi.decide({
      requestId: req.requestId,
      decision: 'APPROVED',
      approverId: 'admin',
      comment: 'Approved via UI',
    });
    await loadRequests();
  } catch (e) {
    console.error('Approve failed:', e);
  }
}

async function handleReject(req: GovernanceRequest) {
  try {
    await approvalApi.decide({
      requestId: req.requestId,
      decision: 'REJECTED',
      approverId: 'admin',
      comment: 'Rejected via UI',
    });
    await loadRequests();
  } catch (e) {
    console.error('Reject failed:', e);
  }
}

onMounted(loadRequests);
</script>

<template>
  <div class="page">
    <NebulaPane title="审批管理" description="处理服务发布与治理相关的审批请求">
      <div class="page__toolbar">
        <NebulaButton variant="outline" @click="loadRequests"
          >刷新</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="requests"
          :loading="loading"
          row-key="requestId"
          :scroll-x="{ enabled: true }"
        >
          <NebulaTableColumn
            field="requestId"
            title="申请 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="resourceId"
            title="资源 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="resourceType" title="类型" width="96" />
          <NebulaTableColumn field="kind" title="操作" width="96" />
          <NebulaTableColumn field="applicantId" title="申请人" width="96" />
          <NebulaTableColumn field="status" title="状态" width="96">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ statusLabel(row.status) }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn
            field="reason"
            title="原因"
            min-width="120"
            show-overflow="tooltip"
          >
            <template #default="{ row }">
              {{ row.reason || '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdAt" title="提交时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="审批操作" width="160">
            <template #default="{ row }">
              <div v-if="canDecide(row)" class="row-actions">
                <NebulaButton variant="outline" @click="handleApprove(row)">
                  通过
                </NebulaButton>
                <NebulaButton variant="outline" @click="handleReject(row)">
                  驳回
                </NebulaButton>
              </div>
              <span v-else class="page__meta">-</span>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>
  </div>
</template>
