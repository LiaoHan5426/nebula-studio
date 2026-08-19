<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { pluginApi } from '@/features/plugin/api';
import { subscriptionRequestApi } from '@/features/subscription/api';
import { interfaceApi } from '@/shared/api/integration';
import { isApiSuccess } from '@/shared/types';

interface SummaryMetric {
  label: string;
  value: number | string;
  hint: string;
  tone: 'danger' | 'default' | 'warning';
}

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const partial = ref(false);
const serviceCount = ref(0);
const draftPublishCount = ref(0);
const pendingPluginCount = ref(0);
const pendingRequestCount = ref(0);
const failedPluginCount = ref(0);

const admin = computed(() => route.meta.surface === 'admin');
const title = computed(() => (admin.value ? '平台治理工作台' : '提供方工作台'));
const description = computed(() =>
  admin.value
    ? '优先处理审批、异常和平台风险，再进入具体治理对象。'
    : '从待发布服务、访问申请和运行状态开始今天的工作。',
);
const metrics = computed<SummaryMetric[]>(() =>
  admin.value
    ? [
        {
          label: '插件待审批',
          value: pendingPluginCount.value,
          hint: '需要平台管理员判断运行风险',
          tone: pendingPluginCount.value ? 'warning' : 'default',
        },
        {
          label: '访问申请待处理',
          value: pendingRequestCount.value,
          hint: '等待审批或补充授权范围',
          tone: pendingRequestCount.value ? 'warning' : 'default',
        },
        {
          label: '插件异常',
          value: failedPluginCount.value,
          hint: '测试失败或运行状态异常',
          tone: failedPluginCount.value ? 'danger' : 'default',
        },
      ]
    : [
        {
          label: '服务总数',
          value: serviceCount.value,
          hint: '当前组织登记的 API 服务',
          tone: 'default',
        },
        {
          label: '待处理申请',
          value: pendingRequestCount.value,
          hint: '消费者等待你的响应',
          tone: pendingRequestCount.value ? 'warning' : 'default',
        },
        {
          label: '待发布',
          value: draftPublishCount.value,
          hint:
            draftPublishCount.value > 0
              ? '草稿或未发布服务待处理'
              : '暂无待发布服务',
          tone: draftPublishCount.value ? 'warning' : 'default',
        },
      ],
);

async function load(): Promise<void> {
  loading.value = true;
  partial.value = false;
  const [services, plugins, requests] = await Promise.allSettled([
    interfaceApi.list({ page: 1, pageSize: 100 }),
    pluginApi.list({ page: 1, pageSize: 100 }),
    subscriptionRequestApi.list({ page: 1, pageSize: 100 }),
  ]);
  if (services.status === 'fulfilled' && isApiSuccess(services.value)) {
    serviceCount.value =
      services.value.data.total ?? services.value.data.items.length;
    draftPublishCount.value = (services.value.data.items ?? []).filter((item) =>
      ['DRAFT', 'PENDING_PUBLISH', 'UNPUBLISHED'].includes(
        String(item.status ?? ''),
      ),
    ).length;
  } else partial.value = true;
  if (plugins.status === 'fulfilled' && isApiSuccess(plugins.value)) {
    const items = plugins.value.data.items ?? [];
    pendingPluginCount.value = items.filter(
      (item) => item.status === 'PENDING_REVIEW',
    ).length;
    failedPluginCount.value = items.filter(
      (item) => item.status === 'FAILED',
    ).length;
  } else partial.value = true;
  if (requests.status === 'fulfilled' && isApiSuccess(requests.value)) {
    pendingRequestCount.value = (requests.value.data.items ?? []).filter(
      (item) =>
        ['NEEDS_INFO', 'PENDING', 'PENDING_REVIEW'].includes(item.status),
    ).length;
  } else partial.value = true;
  loading.value = false;
}

onMounted(load);
</script>

<template>
  <main class="management-home">
    <NebulaPageHeader
      :eyebrow="admin ? 'Admin workspace' : 'Provider workspace'"
      :title="title"
      :description="description"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="load">刷新摘要</NebulaButton>
        <NebulaButton
          @click="
            router.push(
              admin ? '/manage/subscription-requests' : '/provider/services',
            )
          "
        >
          {{ admin ? '处理待审批' : '管理服务' }}
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <p v-if="partial" class="partial-notice" role="status">
      部分摘要暂时不可用，其余数据仍可继续使用。
    </p>

    <section class="metric-grid" aria-label="工作摘要">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="metric-card"
        :data-tone="metric.tone"
      >
        <span>{{ metric.label }}</span>
        <strong>{{ loading ? '…' : metric.value }}</strong>
        <p>{{ metric.hint }}</p>
      </article>
    </section>

    <section class="work-sections">
      <article class="work-card">
        <header>
          <div>
            <span>Next actions</span>
            <h2>{{ admin ? '治理待办' : '提供方待办' }}</h2>
          </div>
          <NebulaTag>
            {{ pendingRequestCount + pendingPluginCount }} 项
          </NebulaTag>
        </header>
        <div class="action-list">
          <button
            v-if="admin"
            type="button"
            @click="router.push('/manage/plugins')"
          >
            <strong>审核插件与运行能力</strong>
            <span>{{ pendingPluginCount }} 个插件等待处理</span>
          </button>
          <button
            type="button"
            @click="
              router.push(
                admin ? '/manage/subscription-requests' : '/provider/approvals',
              )
            "
          >
            <strong>处理访问与发布申请</strong>
            <span>{{ pendingRequestCount }} 项申请等待响应</span>
          </button>
          <button
            type="button"
            @click="
              router.push(admin ? '/manage/governance' : '/provider/publish')
            "
          >
            <strong>{{ admin ? '检查治理策略' : '发布服务版本' }}</strong>
            <span>进入任务上下文继续处理</span>
          </button>
        </div>
      </article>

      <NebulaEmptyState
        v-if="
          !loading &&
          pendingRequestCount === 0 &&
          (!admin || pendingPluginCount === 0)
        "
        title="当前没有紧急待办"
        description="可以检查运行异常、准备下一版本，或返回资源门户。"
      />
    </section>
  </main>
</template>

<style scoped>
.management-home {
  display: grid;
  gap: var(--space-5);
}

.partial-notice {
  padding: var(--space-3);
  margin: 0;
  background: hsl(var(--warning, 40 90% 55%) / 12%);
  border-radius: var(--radius-md);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.metric-card,
.work-card {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.metric-card[data-tone='warning'] {
  border-color: hsl(var(--warning, 40 90% 55%) / 50%);
}

.metric-card[data-tone='danger'] {
  border-color: hsl(var(--destructive) / 50%);
}

.metric-card span,
.work-card header span {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-card strong {
  display: block;
  margin-top: var(--space-2);
  font-size: 32px;
}

.metric-card p {
  margin: var(--space-2) 0 0;
  color: hsl(var(--muted-foreground));
}

.work-sections {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: var(--space-4);
}

.work-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.work-card h2 {
  margin: 4px 0 0;
  font-size: 19px;
}

.action-list {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.action-list button {
  display: grid;
  gap: 4px;
  padding: var(--space-3);
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 35%);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.action-list button:hover {
  border-color: hsl(var(--primary) / 35%);
}

.action-list span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-transform: none;
  letter-spacing: 0;
}

@media (width <= 760px) {
  .metric-grid,
  .work-sections {
    grid-template-columns: 1fr;
  }
}
</style>
