<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import {
  subscriptionApi,
  subscriptionRequestApi,
} from '@/features/subscription/api';
import type { SubscriptionRequestRecord } from '@/features/subscription/api';
import { getAuthUserId } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';
import type { TableSubscription } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

import { normalizeRequestStatus } from './mappers';
import { trackPortalEvent } from './storage';

const router = useRouter();
const { currentTenantId } = useTenant();
const requests = ref<SubscriptionRequestRecord[]>([]);
const subscriptions = ref<TableSubscription[]>([]);
const loading = ref(true);
const error = ref('');
const activeTab = ref<'ACCESS' | 'SUBSCRIPTIONS'>('ACCESS');

const approvedRequests = computed(() =>
  requests.value.filter(
    (request) => normalizeRequestStatus(request.status) === 'APPROVED',
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
  const [requestResult, subscriptionResult] = await Promise.allSettled([
    subscriptionRequestApi.listByUser(userId),
    subscriptionApi.list({
      tenantId: currentTenantId.value || undefined,
      pageSize: 100,
    }),
  ]);
  if (
    requestResult.status === 'fulfilled' &&
    isApiSuccess(requestResult.value)
  ) {
    requests.value = requestResult.value.data;
  }
  if (
    subscriptionResult.status === 'fulfilled' &&
    isApiSuccess(subscriptionResult.value)
  ) {
    subscriptions.value = subscriptionResult.value.data.items;
  }
  if (
    requestResult.status === 'rejected' &&
    subscriptionResult.status === 'rejected'
  ) {
    error.value = '我的资源暂时无法加载，请稍后重试。';
  }
  loading.value = false;
}

function resourceName(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceName || request.interfaceId || '已授权资源',
  );
}

function accessKind(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceKind ||
      request.requestType.replace('ACCESS_', ''),
  );
}

function accessEndpoint(request: SubscriptionRequestRecord): string {
  return accessKind(request) === 'API'
    ? `/gateway/${currentTenantId.value || '{tenant}'}/${request.interfaceId}`
    : accessKind(request) === 'CONNECTOR'
      ? `connector://${request.interfaceId}`
      : `subscription://${request.interfaceId}`;
}

function markFirstAccess(request: SubscriptionRequestRecord): void {
  trackPortalEvent('approved_resource_first_access', {
    requestId: request.requestId,
    resourceId: request.interfaceId,
  });
}

onMounted(load);
</script>

<template>
  <main class="resources-page">
    <NebulaPageHeader
      eyebrow="My resources"
      title="我的资源"
      description="集中查看已获授权的服务能力和库表订阅，并获取接入、凭证与续期信息。"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="router.push('/my-requests')">
          我的申请
        </NebulaButton>
        <NebulaButton @click="router.push('/catalog')"
          >发现更多资源</NebulaButton
        >
      </template>
    </NebulaPageHeader>

    <div class="resource-tabs" role="tablist" aria-label="我的资源分类">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'ACCESS'"
        :class="{ active: activeTab === 'ACCESS' }"
        @click="activeTab = 'ACCESS'"
      >
        已授权资源 <span>{{ approvedRequests.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'SUBSCRIPTIONS'"
        :class="{ active: activeTab === 'SUBSCRIPTIONS' }"
        @click="activeTab = 'SUBSCRIPTIONS'"
      >
        库表订阅 <span>{{ subscriptions.length }}</span>
      </button>
    </div>

    <div v-if="loading" class="owned-grid">
      <div v-for="index in 4" :key="index" class="owned-skeleton" />
    </div>
    <NebulaEmptyState
      v-else-if="error"
      title="资源加载失败"
      :description="error"
    >
      <NebulaButton @click="load">重新加载</NebulaButton>
    </NebulaEmptyState>
    <template v-else-if="activeTab === 'ACCESS'">
      <NebulaEmptyState
        v-if="approvedRequests.length === 0"
        title="还没有已授权资源"
        description="申请通过后，接入地址、鉴权方式和凭证状态会集中显示在这里。"
      >
        <NebulaButton @click="router.push('/catalog')"
          >浏览资源目录</NebulaButton
        >
      </NebulaEmptyState>
      <section v-else class="owned-grid">
        <article
          v-for="request in approvedRequests"
          :key="request.requestId"
          class="owned-card"
        >
          <header>
            <div>
              <span class="kind">{{ accessKind(request) }}</span>
              <h2>{{ resourceName(request) }}</h2>
            </div>
            <NebulaTag>凭证有效</NebulaTag>
          </header>
          <dl>
            <div>
              <dt>接入地址</dt>
              <dd>
                <code>{{ accessEndpoint(request) }}</code>
              </dd>
            </div>
            <div>
              <dt>鉴权方式</dt>
              <dd>Bearer Token / 平台凭证</dd>
            </div>
            <div>
              <dt>使用环境</dt>
              <dd>{{ request.requestConfig?.environment || '按授权策略' }}</dd>
            </div>
          </dl>
          <footer>
            <NebulaButton size="sm" @click="markFirstAccess(request)">
              打开接入指南
            </NebulaButton>
            <NebulaButton
              size="sm"
              variant="outline"
              @click="router.push('/catalog')"
            >
              申请续期
            </NebulaButton>
          </footer>
        </article>
      </section>
    </template>
    <template v-else>
      <NebulaEmptyState
        v-if="subscriptions.length === 0"
        title="还没有库表订阅"
        description="你可以从资源目录申请数据资源，也可进入兼容入口创建订阅。"
      >
        <NebulaButton @click="router.push('/catalog?kind=TABLE')">
          查找数据资源
        </NebulaButton>
      </NebulaEmptyState>
      <section v-else class="owned-grid">
        <article
          v-for="subscription in subscriptions"
          :key="subscription.subscriptionId"
          class="owned-card"
        >
          <header>
            <div>
              <span class="kind">TABLE</span>
              <h2>{{ subscription.tableName }}</h2>
            </div>
            <NebulaTag>{{ subscription.status }}</NebulaTag>
          </header>
          <dl>
            <div>
              <dt>数据源</dt>
              <dd>{{ subscription.dataSourceId }}</dd>
            </div>
            <div>
              <dt>订阅方式</dt>
              <dd>{{ subscription.subscribeType }}</dd>
            </div>
            <div>
              <dt>事件范围</dt>
              <dd>{{ subscription.config.eventTypes.join('、') }}</dd>
            </div>
          </dl>
          <footer>
            <NebulaButton size="sm" @click="router.push('/subscriptions')">
              查看订阅事件
            </NebulaButton>
            <NebulaButton
              size="sm"
              variant="outline"
              @click="router.push('/subscriptions')"
            >
              管理订阅
            </NebulaButton>
          </footer>
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.resources-page {
  display: grid;
  gap: var(--space-5);
  max-width: 1120px;
  padding: var(--space-6);
  margin: 0 auto;
}

.resource-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: hsl(var(--muted) / 60%);
  border-radius: var(--radius-md);
}

.resource-tabs button {
  flex: 1;
  padding: 10px 14px;
  font: inherit;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) - 3px);
}

.resource-tabs button.active {
  font-weight: 700;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  box-shadow: 0 2px 8px hsl(var(--foreground) / 8%);
}

.resource-tabs span {
  margin-left: 5px;
  color: hsl(var(--primary));
}

.owned-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.owned-card {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.owned-card header,
.owned-card footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.kind {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  letter-spacing: 0.08em;
}

.owned-card h2 {
  margin: 5px 0 0;
  font-size: 18px;
}

.owned-card dl {
  display: grid;
  margin: 0;
}

.owned-card dl div {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: var(--space-3);
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.owned-card dt {
  color: hsl(var(--muted-foreground));
}

.owned-card dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.owned-card code {
  font-size: 12px;
}

.owned-skeleton {
  min-height: 260px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

@media (width <= 720px) {
  .resources-page {
    padding: var(--space-4);
  }

  .owned-grid {
    grid-template-columns: 1fr;
  }
}
</style>
