<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  NebulaButton,
  NebulaDetailSection,
  NebulaEmptyState,
  NebulaFilterBar,
  NebulaInput,
  NebulaPageHeader,
  NebulaResourceCard,
  NebulaSearchHero,
  NebulaSelect,
  NebulaStatusTimeline,
  NebulaStepFlow,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

type PreviewState =
  | 'content'
  | 'disabled'
  | 'empty'
  | 'error'
  | 'loading'
  | 'partial'
  | 'restricted';

const previewState = ref<PreviewState>('content');
const keyword = ref('');
const resourceType = ref('');
const searchNotice = ref('');

const stateOptions = [
  { value: 'content', label: '完整内容' },
  { value: 'loading', label: '加载中' },
  { value: 'empty', label: '空状态' },
  { value: 'error', label: '错误状态' },
  { value: 'restricted', label: '无权限' },
  { value: 'partial', label: '部分数据' },
  { value: 'disabled', label: '禁用状态' },
];

const resourceTypeOptions = [
  { value: '', label: '全部资源' },
  { value: 'api', label: 'API' },
  { value: 'table', label: '库表' },
  { value: 'connector', label: 'Connector' },
];

const timelineItems = [
  {
    id: 'submitted',
    title: '已提交申请',
    description: '用途与访问范围已记录。',
    timestamp: '09:20',
    state: 'complete' as const,
  },
  {
    id: 'review',
    title: '组织管理员审批',
    description: '预计在一个工作日内完成。',
    timestamp: '进行中',
    state: 'current' as const,
  },
  {
    id: 'granted',
    title: '开通访问',
    description: '审批完成后自动生成接入指引。',
    state: 'pending' as const,
  },
];

const stepItems = [
  { id: 'scope', label: '访问范围', state: 'complete' as const },
  { id: 'purpose', label: '用途说明', state: 'current' as const },
  { id: 'review', label: '确认提交', state: 'pending' as const },
];

const resultSummary = computed(() =>
  keyword.value ? `正在筛选“${keyword.value}”` : '共 24 项示例资源',
);

function handleSearch(value: string): void {
  searchNotice.value = value
    ? `已记录搜索：${value}`
    : '请输入资源、应用或文档名称';
}
</script>

<template>
  <div class="experience-baseline">
    <NebulaPageHeader
      eyebrow="Phase 2"
      title="全局体验基线"
      description="六类界面共享同一套排版、密度、状态与交互语言；业务页面只组合模式，不重新声明视觉常量。"
      help-href="/guide/theming"
    >
      <template #actions>
        <NebulaSelect
          v-model="previewState"
          :options="stateOptions"
          aria-label="切换预览状态"
        />
      </template>
    </NebulaPageHeader>

    <NebulaSearchHero
      v-model="keyword"
      title="查找你需要的资源"
      description="统一搜索 API、库表、Connector、应用和帮助文档。"
      @search="handleSearch"
    >
      <template #suggestions>
        <span>热门：订单 API</span>
        <span>客户主数据</span>
        <span>HTTP Connector</span>
      </template>
    </NebulaSearchHero>
    <p v-if="searchNotice" class="experience-baseline__notice" role="status">
      {{ searchNotice }}
    </p>

    <NebulaFilterBar :result-summary="resultSummary">
      <NebulaInput v-model="keyword" placeholder="筛选当前结果" />
      <NebulaSelect
        v-model="resourceType"
        :options="resourceTypeOptions"
        aria-label="资源类型"
      />
      <template #actions>
        <NebulaButton variant="outline" @click="keyword = ''">
          重置
        </NebulaButton>
      </template>
    </NebulaFilterBar>

    <div
      v-if="previewState === 'loading'"
      class="experience-baseline__loading"
      role="status"
      aria-busy="true"
    >
      <span v-for="index in 3" :key="index"></span>
      <p>正在加载资源…</p>
    </div>

    <NebulaEmptyState
      v-else-if="previewState === 'empty'"
      title="没有找到匹配资源"
      description="调整关键词或清除筛选条件后重试。"
    >
      <template #actions>
        <NebulaButton @click="previewState = 'content'">
          查看全部资源
        </NebulaButton>
      </template>
    </NebulaEmptyState>

    <NebulaEmptyState
      v-else-if="previewState === 'error'"
      tone="error"
      title="资源目录暂时不可用"
      description="保留当前筛选条件，你可以稍后重试。"
    >
      <template #actions>
        <NebulaButton @click="previewState = 'content'">重试</NebulaButton>
      </template>
    </NebulaEmptyState>

    <NebulaEmptyState
      v-else-if="previewState === 'restricted'"
      tone="restricted"
      title="暂无访问权限"
      description="联系组织管理员，或返回可申请资源列表。"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="previewState = 'content'">
          返回资源目录
        </NebulaButton>
      </template>
    </NebulaEmptyState>

    <div v-else class="experience-baseline__grid">
      <p
        v-if="previewState === 'partial'"
        class="experience-baseline__partial"
        role="status"
      >
        部分提供方数据暂未返回，当前先展示 18 项可用资源。
      </p>
      <NebulaResourceCard
        title="订单查询 API"
        description="按订单号查询订单状态、金额和履约节点，适合客服和订单运营场景。"
        type-label="API"
        provider="交易平台"
        interactive
      >
        <template #status>
          <NebulaTag variant="success">可申请</NebulaTag>
        </template>
        <template #tags>
          <NebulaTag>订单</NebulaTag>
          <NebulaTag>实时</NebulaTag>
        </template>
        <template #actions>
          <NebulaButton size="sm" :disabled="previewState === 'disabled'">
            查看详情
          </NebulaButton>
          <NebulaButton
            size="sm"
            variant="outline"
            :disabled="previewState === 'disabled'"
          >
            申请访问
          </NebulaButton>
        </template>
      </NebulaResourceCard>

      <NebulaResourceCard
        title="客户主数据"
        description="标准客户主数据表，包含客户身份、分群和生命周期状态。"
        type-label="库表"
        provider="数据治理团队"
      >
        <template #status>
          <NebulaTag variant="warning">需审批</NebulaTag>
        </template>
      </NebulaResourceCard>
    </div>

    <NebulaDetailSection
      title="申请流程"
      description="步骤和时间线使用结构化状态，不只依赖颜色表达。"
    >
      <NebulaStepFlow :steps="stepItems" />
      <NebulaStatusTimeline :items="timelineItems" />
    </NebulaDetailSection>
  </div>
</template>

<style scoped>
.experience-baseline {
  display: grid;
  gap: var(--surface-gap-comfortable);
}

.experience-baseline__notice {
  margin: calc(var(--space-4) * -1) 0 0;
  font-size: var(--font-size-caption);
  color: hsl(var(--muted-foreground));
}

.experience-baseline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: var(--space-4);
}

.experience-baseline__partial {
  grid-column: 1 / -1;
  padding: var(--space-3) var(--space-4);
  margin: 0;
  color: hsl(var(--warning-foreground));
  background: hsl(var(--warning) / 12%);
  border: 1px solid hsl(var(--warning) / 38%);
  border-radius: var(--radius-md);
}

.experience-baseline__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.experience-baseline__loading span {
  min-height: 12rem;
  background: linear-gradient(
    90deg,
    hsl(var(--muted) / 50%),
    hsl(var(--muted)),
    hsl(var(--muted) / 50%)
  );
  background-size: 200% 100%;
  border-radius: var(--radius-lg);
  animation: experience-loading 1.3s linear infinite;
}

.experience-baseline__loading p {
  grid-column: 1 / -1;
  margin: 0;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

@keyframes experience-loading {
  to {
    background-position: -200% 0;
  }
}

@media (width <= 48rem) {
  .experience-baseline__loading {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .experience-baseline__loading span {
    animation: none;
  }
}
</style>
