<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { subscriptionRequestApi } from '@/features/subscription/api';
import type { SubscriptionRequestRecord } from '@/features/subscription/api';
import { getAuthUserId } from '@/shared/auth/session';
import { isApiSuccess } from '@/shared/types';

import { normalizeRequestStatus } from './mappers';
import type { AccessRequestStatus } from './types';

const router = useRouter();
const requests = ref<SubscriptionRequestRecord[]>([]);
const loading = ref(true);
const error = ref('');
const status = ref('');
const cancellingId = ref('');

const visibleRequests = computed(() =>
  requests.value.filter(
    (request) =>
      !status.value || normalizeRequestStatus(request.status) === status.value,
  ),
);

async function load(): Promise<void> {
  const userId = getAuthUserId();
  if (!userId) {
    error.value = '无法识别当前用户，请重新登录。';
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const response = await subscriptionRequestApi.listByUser(userId);
    if (isApiSuccess(response)) requests.value = response.data;
    else error.value = response.message || '申请记录加载失败。';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '申请记录加载失败。';
  } finally {
    loading.value = false;
  }
}

async function cancel(request: SubscriptionRequestRecord): Promise<void> {
  cancellingId.value = request.requestId;
  try {
    const response = await subscriptionRequestApi.cancel(request.requestId);
    if (isApiSuccess(response)) await load();
  } finally {
    cancellingId.value = '';
  }
}

function resourceName(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceName ||
      request.interfaceId ||
      '资源访问申请',
  );
}

function statusCopy(value: AccessRequestStatus): {
  label: string;
  description: string;
  action: string;
} {
  return {
    DRAFT: {
      label: '草稿',
      description: '申请尚未提交。',
      action: '继续填写申请',
    },
    NEEDS_INFO: {
      label: '待补充',
      description: '审批人需要更多使用场景或范围信息。',
      action: '补充申请信息',
    },
    PENDING: {
      label: '审批中',
      description: '申请已进入审批流程，请等待审批人处理。',
      action: '可取消申请',
    },
    APPROVED: {
      label: '已通过',
      description: '访问权限已准备，可以前往我的资源查看接入信息。',
      action: '查看接入信息',
    },
    REJECTED: {
      label: '已拒绝',
      description: '请查看审批意见，调整范围后可重新申请。',
      action: '重新查找资源',
    },
    EXPIRED: {
      label: '已到期',
      description: '原访问期限已结束，可按当前用途发起续期。',
      action: '发起续期',
    },
    CANCELLED: {
      label: '已取消',
      description: '该申请已由你取消。',
      action: '重新查找资源',
    },
  }[value];
}

function nextAction(
  request: SubscriptionRequestRecord,
  value: AccessRequestStatus,
): void {
  if (value === 'PENDING') {
    void cancel(request);
    return;
  }
  if (value === 'APPROVED') {
    void router.push('/my-resources');
    return;
  }
  void router.push('/catalog');
}

onMounted(load);
</script>

<template>
  <main class="requests-page">
    <NebulaPageHeader
      eyebrow="Access requests"
      title="我的申请"
      description="跟踪审批进度、补充所需信息，并在通过后继续获取接入方式。"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="router.push('/catalog')">
          浏览资源
        </NebulaButton>
        <NebulaButton @click="router.push('/my-resources')">
          我的资源
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <div class="requests-toolbar">
      <NebulaSelect
        v-model="status"
        :options="[
          { label: '全部状态', value: '' },
          { label: '待补充', value: 'NEEDS_INFO' },
          { label: '审批中', value: 'PENDING' },
          { label: '已通过', value: 'APPROVED' },
          { label: '已拒绝', value: 'REJECTED' },
          { label: '已到期', value: 'EXPIRED' },
        ]"
        aria-label="申请状态"
      />
      <span>{{ visibleRequests.length }} 条申请</span>
    </div>

    <div v-if="loading" class="request-list">
      <div v-for="index in 3" :key="index" class="request-skeleton" />
    </div>
    <NebulaEmptyState
      v-else-if="error"
      title="申请记录加载失败"
      :description="error"
    >
      <NebulaButton @click="load">重新加载</NebulaButton>
    </NebulaEmptyState>
    <NebulaEmptyState
      v-else-if="visibleRequests.length === 0"
      title="还没有匹配的申请"
      description="从资源目录找到所需能力，在详情页即可发起申请。"
    >
      <NebulaButton @click="router.push('/catalog')">浏览资源目录</NebulaButton>
    </NebulaEmptyState>
    <section v-else class="request-list" aria-label="申请时间线">
      <article
        v-for="request in visibleRequests"
        :key="request.requestId"
        class="request-item"
      >
        <div
          class="timeline-dot"
          :data-status="normalizeRequestStatus(request.status)"
        />
        <div class="request-content">
          <div class="request-heading">
            <div>
              <span>{{ request.requestType.replace('ACCESS_', '') }}</span>
              <h2>{{ resourceName(request) }}</h2>
            </div>
            <NebulaTag>
              {{ statusCopy(normalizeRequestStatus(request.status)).label }}
            </NebulaTag>
          </div>
          <p>
            {{ statusCopy(normalizeRequestStatus(request.status)).description }}
          </p>
          <blockquote v-if="request.reason">{{ request.reason }}</blockquote>
          <footer>
            <span>
              {{ request.createdAt || '提交时间待同步' }} ·
              {{ request.requestId }}
            </span>
            <NebulaButton
              size="sm"
              :variant="
                normalizeRequestStatus(request.status) === 'PENDING'
                  ? 'outline'
                  : 'primary'
              "
              :disabled="cancellingId === request.requestId"
              @click="
                nextAction(request, normalizeRequestStatus(request.status))
              "
            >
              {{
                cancellingId === request.requestId
                  ? '正在取消…'
                  : statusCopy(normalizeRequestStatus(request.status)).action
              }}
            </NebulaButton>
          </footer>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.requests-page {
  display: grid;
  gap: var(--space-5);
  max-width: 1060px;
  padding: var(--space-6);
  margin: 0 auto;
}

.requests-toolbar,
.request-heading,
.request-item footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.requests-toolbar {
  padding: var(--space-3);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.requests-toolbar span {
  color: hsl(var(--muted-foreground));
}

.request-list {
  display: grid;
  gap: var(--space-3);
}

.request-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  background: hsl(var(--muted-foreground));
  border: 3px solid hsl(var(--background));
  border-radius: 50%;
  box-shadow: 0 0 0 2px hsl(var(--muted-foreground));
}

.timeline-dot[data-status='APPROVED'] {
  background: hsl(var(--success, 145 60% 40%));
  box-shadow: 0 0 0 2px hsl(var(--success, 145 60% 40%));
}

.timeline-dot[data-status='REJECTED'],
.timeline-dot[data-status='EXPIRED'] {
  background: hsl(var(--destructive));
  box-shadow: 0 0 0 2px hsl(var(--destructive));
}

.timeline-dot[data-status='PENDING'],
.timeline-dot[data-status='NEEDS_INFO'] {
  background: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary));
}

.request-content {
  display: grid;
  gap: var(--space-3);
}

.request-heading span {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.request-heading h2 {
  margin: 5px 0 0;
  font-size: 18px;
}

.request-content p {
  margin: 0;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

blockquote {
  padding: 10px 12px;
  margin: 0;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 45%);
  border-left: 3px solid hsl(var(--primary));
}

.request-item footer {
  padding-top: var(--space-3);
  border-top: 1px solid hsl(var(--border));
}

.request-item footer span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.request-skeleton {
  min-height: 170px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

@media (width <= 620px) {
  .requests-page {
    padding: var(--space-4);
  }
}
</style>
