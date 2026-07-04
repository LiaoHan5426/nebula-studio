<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { subscriptionRequestApi } from '@/shared/api/consoleApi';
import type { SubscriptionRequestRecord } from '@/shared/api/consoleApi';
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

async function handleReject(row: SubscriptionRequestRecord) {
  openReject(row);
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
  <div class="subscription-requests-page">
    <header class="subscription-requests-page__header">
      <div>
        <h2 class="subscription-requests-page__title">订阅审批</h2>
        <p class="subscription-requests-page__desc">
          审批服务订阅与库表订阅申请；服务订阅通过时可预填授权配额
        </p>
      </div>
      <div class="subscription-requests-page__actions">
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
        <NebulaButton variant="secondary" @click="loadRequests"
          >刷新</NebulaButton
        >
      </div>
    </header>

    <div class="subscription-requests-page__table-wrap">
      <NebulaTable
        :data="requests"
        :loading="loading"
        :scroll-x="{ enabled: false }"
        row-key="requestId"
        class="subscription-requests-page__table"
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
            <div v-if="row.status === 'PENDING'" class="action-btns">
              <NebulaButton variant="secondary" @click="openApprove(row)">
                通过
              </NebulaButton>
              <NebulaButton variant="secondary" @click="handleReject(row)">
                拒绝
              </NebulaButton>
            </div>
            <span v-else class="muted">—</span>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div v-if="approveTarget" class="approve-dialog">
      <div class="approve-dialog__panel">
        <h3>审批通过并授权</h3>
        <p class="approve-dialog__meta">
          租户 {{ approveTarget.tenantId }} · 服务
          {{ approveTarget.interfaceId }}
        </p>
        <label class="approve-dialog__field">
          授权到期
          <input v-model="grantForm.expiresAt" type="datetime-local" />
        </label>
        <label class="approve-dialog__field">
          最大调用次数
          <NebulaInput v-model="grantForm.maxCalls" type="number" />
        </label>
        <label class="approve-dialog__field">
          频率上限（次/窗口）
          <NebulaInput v-model="grantForm.rateLimitMax" type="number" />
        </label>
        <label class="approve-dialog__field">
          频率窗口（秒）
          <NebulaInput
            v-model="grantForm.rateLimitWindowSeconds"
            type="number"
          />
        </label>
        <label class="approve-dialog__field">
          服务时间
          <NebulaSelect
            v-model="grantForm.scheduleType"
            :options="GRANT_SCHEDULE_OPTIONS as any"
          />
        </label>
        <div
          v-if="grantForm.scheduleType !== 'ALWAYS'"
          class="approve-dialog__row"
        >
          <label class="approve-dialog__field">
            开始
            <input v-model="grantForm.scheduleStartTime" type="time" />
          </label>
          <label class="approve-dialog__field">
            结束
            <input v-model="grantForm.scheduleEndTime" type="time" />
          </label>
        </div>
        <div class="approve-dialog__actions">
          <NebulaButton variant="secondary" @click="approveTarget = null"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="submitApprove"
            >确认通过</NebulaButton
          >
        </div>
      </div>
    </div>
    <div v-if="rejectTarget" class="approve-dialog">
      <div class="approve-dialog__panel">
        <h3>拒绝订阅申请</h3>
        <p class="approve-dialog__meta">
          租户 {{ rejectTarget.tenantId }} · 服务 {{ rejectTarget.interfaceId }}
        </p>
        <label class="approve-dialog__field">
          拒绝原因
          <NebulaInput
            v-model="rejectReason"
            type="text"
            placeholder="请输入拒绝原因"
          />
        </label>
        <div class="approve-dialog__actions">
          <NebulaButton variant="secondary" @click="rejectTarget = null"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="submitReject"
            >确认拒绝</NebulaButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-requests-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subscription-requests-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.subscription-requests-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.subscription-requests-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.subscription-requests-page__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-filter {
  min-width: 120px;
}

.subscription-requests-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.action-btns {
  display: inline-flex;
  gap: 6px;
}

.muted {
  color: hsl(var(--muted-foreground));
}

.approve-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 40%);
}

.approve-dialog__panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(480px, 92vw);
  padding: 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.approve-dialog__meta {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.approve-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.approve-dialog__field input {
  padding: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.approve-dialog__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.approve-dialog__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
