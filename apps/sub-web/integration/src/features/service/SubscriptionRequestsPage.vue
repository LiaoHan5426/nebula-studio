<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { subscriptionRequestApi } from '@/features/subscription/api';
import type { SubscriptionRequestRecord } from '@/features/subscription/api';
import { GRANT_SCHEDULE_OPTIONS } from '@/shared/grant/schedule';
import { isApiSuccess } from '@/shared/types';

const requests = ref<SubscriptionRequestRecord[]>([]);
const loading = ref(false);
const statusFilter = ref('PENDING');
const approveTarget = ref<SubscriptionRequestRecord | null>(null);
const rejectTarget = ref<SubscriptionRequestRecord | null>(null);
const rejectReason = ref('');
const grantForm = ref({
  expiresAt: '',
  maxCalls: '',
  rateLimitMax: '',
  rateLimitWindowSeconds: '60',
  scheduleType: 'ALWAYS',
  scheduleStartTime: '08:00',
  scheduleEndTime: '20:00',
});

onMounted(() => {
  void loadRequests();
});

async function loadRequests() {
  loading.value = true;
  try {
    const response = await subscriptionRequestApi.list({
      pageSize: 100,
      status: statusFilter.value || undefined,
    });
    if (isApiSuccess(response)) {
      requests.value = response.data.items ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function openApprove(row: SubscriptionRequestRecord) {
  approveTarget.value = row;
  grantForm.value = {
    expiresAt: '',
    maxCalls: '',
    rateLimitMax: '',
    rateLimitWindowSeconds: '60',
    scheduleType: 'ALWAYS',
    scheduleStartTime: '08:00',
    scheduleEndTime: '20:00',
  };
}

async function submitApprove() {
  if (!approveTarget.value) return;
  await subscriptionRequestApi.approve(approveTarget.value.requestId, {
    expiresAt: grantForm.value.expiresAt || undefined,
    maxCalls: grantForm.value.maxCalls
      ? Number(grantForm.value.maxCalls)
      : undefined,
    rateLimitMax: grantForm.value.rateLimitMax
      ? Number(grantForm.value.rateLimitMax)
      : undefined,
    rateLimitWindowSeconds: grantForm.value.rateLimitWindowSeconds
      ? Number(grantForm.value.rateLimitWindowSeconds)
      : undefined,
    scheduleType: grantForm.value.scheduleType,
    scheduleStartTime:
      grantForm.value.scheduleType === 'ALWAYS'
        ? undefined
        : grantForm.value.scheduleStartTime,
    scheduleEndTime:
      grantForm.value.scheduleType === 'ALWAYS'
        ? undefined
        : grantForm.value.scheduleEndTime,
  });
  approveTarget.value = null;
  await loadRequests();
}

function openReject(row: SubscriptionRequestRecord) {
  rejectTarget.value = row;
  rejectReason.value = '';
}

async function submitReject() {
  if (!rejectTarget.value) return;
  const reason = rejectReason.value.trim();
  if (!reason) return;
  await subscriptionRequestApi.reject(rejectTarget.value.requestId, reason);
  rejectTarget.value = null;
  rejectReason.value = '';
  await loadRequests();
}

function statusVariant(status: string) {
  const normalized = status?.toLowerCase();
  if (normalized === 'pending') return 'warning';
  if (normalized === 'approved') return 'success';
  if (normalized === 'rejected') return 'default';
  return 'default';
}

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="订阅审批"
      description="审批服务订阅与库表订阅申请；服务订阅通过时可预填授权配额"
    >
      <div class="page__toolbar">
        <NebulaSelect
          v-model="statusFilter"
          :options="[
            { value: 'PENDING', label: '待审批' },
            { value: 'APPROVED', label: '已通过' },
            { value: 'REJECTED', label: '已拒绝' },
            { value: '', label: '全部' },
          ]"
          class="status-filter"
          @change="loadRequests"
        />
        <NebulaButton variant="outline" @click="loadRequests"
          >刷新</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="requests"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="requestId"
        >
          <NebulaTableColumn
            field="requestId"
            title="申请 ID"
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
          <NebulaTableColumn field="requestType" title="类型" width="100" />
          <NebulaTableColumn field="status" title="状态" width="100">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ row.status }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn
            field="reason"
            title="申请原因"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="createdAt" title="申请时间" width="150">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="160">
            <template #default="{ row }">
              <div v-if="row.status === 'PENDING'" class="row-actions">
                <NebulaButton variant="outline" @click="openApprove(row)">
                  通过
                </NebulaButton>
                <NebulaButton variant="outline" @click="openReject(row)">
                  拒绝
                </NebulaButton>
              </div>
              <span v-else class="muted">—</span>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>

    <div
      v-if="approveTarget"
      class="modal-overlay"
      @click.self="approveTarget = null"
    >
      <NebulaPane title="审批通过并授权" class="modal">
        <p class="field-hint">
          租户 {{ approveTarget.tenantId }} · 服务
          {{ approveTarget.interfaceId }}
        </p>
        <label class="field">
          <span>授权到期</span>
          <input v-model="grantForm.expiresAt" type="datetime-local" />
        </label>
        <label class="field">
          <span>最大调用次数</span>
          <NebulaInput v-model="grantForm.maxCalls" type="number" />
        </label>
        <label class="field">
          <span>频率上限（次/窗口）</span>
          <NebulaInput v-model="grantForm.rateLimitMax" type="number" />
        </label>
        <label class="field">
          <span>频率窗口（秒）</span>
          <NebulaInput
            v-model="grantForm.rateLimitWindowSeconds"
            type="number"
          />
        </label>
        <label class="field">
          <span>服务时间</span>
          <NebulaSelect
            v-model="grantForm.scheduleType"
            :options="GRANT_SCHEDULE_OPTIONS as any"
          />
        </label>
        <div
          v-if="grantForm.scheduleType !== 'ALWAYS'"
          class="approve-dialog__row"
        >
          <label class="field">
            <span>开始</span>
            <input v-model="grantForm.scheduleStartTime" type="time" />
          </label>
          <label class="field">
            <span>结束</span>
            <input v-model="grantForm.scheduleEndTime" type="time" />
          </label>
        </div>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="approveTarget = null">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="submitApprove">
            确认通过
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div
      v-if="rejectTarget"
      class="modal-overlay"
      @click.self="rejectTarget = null"
    >
      <NebulaPane title="拒绝订阅申请" class="modal">
        <p class="field-hint">
          租户 {{ rejectTarget.tenantId }} · 服务 {{ rejectTarget.interfaceId }}
        </p>
        <label class="field">
          <span>拒绝原因</span>
          <NebulaInput
            v-model="rejectReason"
            type="text"
            placeholder="请输入拒绝原因"
          />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="rejectTarget = null">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="submitReject">
            确认拒绝
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.status-filter {
  min-width: 120px;
}

.muted {
  color: hsl(var(--muted-foreground));
}

.field-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.approve-dialog__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
