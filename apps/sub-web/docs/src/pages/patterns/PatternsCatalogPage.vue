<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaButton,
  NebulaEmptyState,
  NebulaFilterBar,
  NebulaInput,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

type PatternId =
  | 'entity'
  | 'detail'
  | 'settings'
  | 'dashboard'
  | 'editor'
  | 'feedback';
const active = ref<PatternId>('entity');
const query = ref('');
const density = ref<'comfortable' | 'compact'>('comfortable');
const feedback = ref<'loading' | 'empty' | 'error' | 'forbidden' | 'offline'>(
  'empty',
);
const patterns: Array<{
  id: PatternId;
  index: string;
  title: string;
  description: string;
  parts: string[];
}> = [
  {
    id: 'entity',
    index: '01',
    title: 'Entity list',
    description: '高密度检索、筛选、批量操作与数据表格。',
    parts: ['PageHeader', 'FilterBar', 'BulkActionBar', 'DataTable'],
  },
  {
    id: 'detail',
    index: '02',
    title: 'Detail',
    description: '对象身份、关键属性、关联信息与活动记录。',
    parts: ['DetailHeader', 'DescriptionList', 'ActivityPanel'],
  },
  {
    id: 'settings',
    index: '03',
    title: 'Settings',
    description: '按主题拆分设置，明确保存状态和验证反馈。',
    parts: ['SettingsSection', 'FormGrid', 'ValidationSummary'],
  },
  {
    id: 'dashboard',
    index: '04',
    title: 'Dashboard',
    description: '用排版和分隔组织指标，限制卡片层级。',
    parts: ['DashboardSection', 'MetricGroup'],
  },
  {
    id: 'editor',
    index: '05',
    title: 'Editor workspace',
    description: '工具栏、资产面板、画布、检查器与底部面板。',
    parts: ['EditorWorkspace', 'InspectorPanel', 'BottomPanel'],
  },
  {
    id: 'feedback',
    index: '06',
    title: 'Feedback states',
    description: '跨应用一致的加载、空、错、禁用与离线反馈。',
    parts: ['Loading', 'Empty', 'Error', 'Forbidden', 'Offline'],
  },
];
const current = computed(() => {
  const found = patterns.find((item) => item.id === active.value);
  if (!found) {
    throw new Error(`Unknown pattern: ${active.value}`);
  }
  return found;
});
const rows = computed(() =>
  ['Orders API', 'Billing table', 'Customer events'].filter((name) =>
    name.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
const feedbackCopy = computed(() => {
  if (feedback.value === 'loading') return null;
  return {
    empty: {
      title: '还没有资源',
      description: '登记第一个资源，或调整筛选条件。',
    },
    error: {
      title: '数据加载失败',
      description: '保留当前筛选条件，稍后重试。',
    },
    forbidden: {
      title: '无权访问',
      description: '联系组织管理员申请所需权限。',
    },
    offline: {
      title: '当前处于离线状态',
      description: '恢复网络后将自动重新连接。',
    },
  }[feedback.value];
});
</script>

<template>
  <main class="pattern-catalog" :data-density="density">
    <NebulaPageHeader
      eyebrow="Design system / Patterns"
      title="页面模式目录"
      description="选择模式、切换密度并操作实时预览，验证信息架构和完整状态语法。"
    >
      <template #actions
        ><div class="segmented">
          <button
            :class="{ active: density === 'comfortable' }"
            @click="density = 'comfortable'"
          >
            舒适</button
          ><button
            :class="{ active: density === 'compact' }"
            @click="density = 'compact'"
          >
            紧凑
          </button>
        </div></template
      >
    </NebulaPageHeader>
    <div class="workbench">
      <nav aria-label="页面模式">
        <button
          v-for="item in patterns"
          :key="item.id"
          :class="{ active: active === item.id }"
          @click="active = item.id"
        >
          <span>{{ item.index }}</span
          ><strong>{{ item.title }}</strong
          ><small>{{ item.description }}</small>
        </button>
      </nav>
      <section class="stage" :aria-label="`${current.title} 交互预览`">
        <header class="stage-head">
          <div>
            <span>Live pattern</span>
            <h2>{{ current.title }}</h2>
            <p>{{ current.description }}</p>
          </div>
          <div>
            <NebulaTag v-for="part in current.parts" :key="part">{{
              part
            }}</NebulaTag>
          </div>
        </header>

        <div v-if="active === 'entity'" class="surface">
          <div class="page-head">
            <div>
              <span>Resources</span>
              <h3>资源目录</h3>
              <p>查找并管理当前组织可用的数据能力。</p>
            </div>
            <NebulaButton variant="primary">登记资源</NebulaButton>
          </div>
          <NebulaFilterBar :result-summary="`${rows.length} 个结果`"
            ><NebulaInput v-model="query" placeholder="搜索名称或类型"
          /></NebulaFilterBar>
          <div class="table">
            <div><b>名称</b><b>类型</b><b>状态</b><b></b></div>
            <div v-for="row in rows" :key="row">
              <strong>{{ row }}</strong
              ><span>API</span><span class="ok">可用</span
              ><button>查看 →</button>
            </div>
          </div>
        </div>

        <div v-else-if="active === 'detail'" class="surface">
          <div class="page-head">
            <div>
              <span>API · v2.4</span>
              <h3>Orders API</h3>
              <p>为订单查询和履约流程提供统一接口。</p>
            </div>
            <div class="actions">
              <NebulaTag>运行正常</NebulaTag
              ><NebulaButton variant="primary">申请访问</NebulaButton>
            </div>
          </div>
          <dl class="description">
            <div>
              <dt>负责人</dt>
              <dd>Commerce Platform</dd>
            </div>
            <div>
              <dt>可见范围</dt>
              <dd>当前组织</dd>
            </div>
            <div>
              <dt>更新于</dt>
              <dd>8 分钟前</dd>
            </div>
            <div>
              <dt>SLA</dt>
              <dd>99.95%</dd>
            </div>
          </dl>
          <div class="activity">
            <h4>最近活动</h4>
            <p>
              <b>版本 2.4 已发布</b><span>新增批量查询端点 · 8 分钟前</span>
            </p>
            <p>
              <b>访问策略已更新</b><span>审批范围调整为组织管理员 · 昨天</span>
            </p>
          </div>
        </div>

        <div v-else-if="active === 'settings'" class="surface settings-demo">
          <header>
            <h3>通知策略</h3>
            <p>控制运行异常和审批事件如何通知团队成员。</p>
          </header>
          <label
            ><span>通知渠道<small>至少保留一种主要渠道</small></span
            ><select>
              <option>站内通知 + 邮件</option>
              <option>仅站内通知</option>
            </select></label
          >
          <label
            ><span>摘要频率<small>合并低优先级事件</small></span
            ><select>
              <option>每小时</option>
              <option>每天</option>
            </select></label
          >
          <div class="validation">
            <strong>保存前检查</strong><span>配置完整，没有阻断项。</span>
          </div>
          <footer>
            <span>尚未保存更改</span
            ><NebulaButton variant="primary">保存设置</NebulaButton>
          </footer>
        </div>

        <div v-else-if="active === 'dashboard'" class="surface">
          <div class="page-head">
            <div>
              <span>Operations</span>
              <h3>平台运行概览</h3>
            </div>
            <small>更新于 1 分钟前</small>
          </div>
          <div class="metrics">
            <div>
              <span>请求成功率</span><strong>99.98%</strong
              ><small>+0.04%</small>
            </div>
            <div>
              <span>P95 延迟</span><strong>182ms</strong
              ><small>目标 &lt; 250ms</small>
            </div>
            <div>
              <span>待处理告警</span><strong>3</strong
              ><small>1 个高优先级</small>
            </div>
          </div>
          <div class="activity">
            <p><b>API Gateway</b><span class="ok">正常</span></p>
            <p><b>Event pipeline</b><span>需关注</span></p>
            <p><b>Registry</b><span class="ok">正常</span></p>
          </div>
        </div>

        <div v-else-if="active === 'editor'" class="editor-demo">
          <header>
            <b>页面设计器</b><span>草稿已保存</span><button>预览</button
            ><button class="primary">发布</button>
          </header>
          <aside>
            <strong>组件</strong><button>指标组</button><button>数据表格</button
            ><button>状态列表</button>
          </aside>
          <main>
            <span>画布 · 1440px</span>
            <div><small>Revenue</small><strong>¥ 1,284,300</strong></div>
            <div><small>Active users</small><strong>8,492</strong></div>
          </main>
          <section>
            <strong>属性</strong><label>标题<input value="Revenue" /></label
            ><label
              >数据源<select>
                <option>orders.summary</option>
              </select></label
            >
          </section>
          <footer>问题 0　警告 1　数据源 4</footer>
        </div>

        <div v-else class="surface feedback-demo">
          <div class="segmented">
            <button
              v-for="state in [
                'loading',
                'empty',
                'error',
                'forbidden',
                'offline',
              ] as const"
              :key="state"
              :class="{ active: feedback === state }"
              @click="feedback = state"
            >
              {{ state }}
            </button>
          </div>
          <div v-if="feedback === 'loading'" class="skeleton" role="status">
            <i></i><i></i><i></i><span>正在加载资源…</span>
          </div>
          <NebulaEmptyState
            v-else-if="feedbackCopy"
            :title="feedbackCopy.title"
            :description="feedbackCopy.description"
            ><NebulaButton>{{
              feedback === 'empty' ? '登记资源' : '重试'
            }}</NebulaButton></NebulaEmptyState
          >
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pattern-catalog {
  display: grid;
  gap: var(--space-6);
}

.segmented {
  display: flex;
  width: max-content;
  padding: 3px;
  background: hsl(var(--muted));
  border-radius: var(--radius-md);
}

.segmented button {
  padding: 7px 11px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) - 2px);
}

.segmented button.active {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  box-shadow: 0 1px 2px hsl(var(--foreground) / 8%);
}

.workbench {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 620px;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.workbench > nav {
  padding: var(--space-2);
  background: hsl(var(--sidebar));
  border-right: 1px solid hsl(var(--border));
}

.workbench > nav button {
  display: grid;
  grid-template-columns: 24px 1fr;
  width: 100%;
  padding: 12px 10px;
  color: hsl(var(--muted-foreground));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
}

.workbench > nav button.active {
  color: hsl(var(--foreground));
  background: hsl(var(--accent));
}

.workbench > nav span {
  grid-row: 1/3;
  font-size: 10px;
  color: hsl(var(--primary));
}

.workbench > nav strong {
  font-size: 13px;
}

.workbench > nav small {
  margin-top: 3px;
  line-height: 1.4;
}

.stage {
  min-width: 0;
  padding: clamp(20px, 3vw, 36px);
}

.stage-head {
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid hsl(var(--border));
}

.stage-head > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  place-content: flex-start flex-end;
}

.stage-head span,
.page-head > div > span {
  font-size: 10px;
  font-weight: 750;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stage-head h2 {
  margin: 4px 0;
  font-size: 22px;
}

.stage-head p,
.page-head p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}

.surface {
  margin-top: var(--space-5);
}

.page-head {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  justify-content: space-between;
}

.page-head h3 {
  margin: 4px 0;
  font-size: 20px;
}

.actions {
  display: flex;
  gap: var(--space-2);
}

.table {
  margin-top: var(--space-3);
  border-top: 1px solid hsl(var(--border));
}

.table > div {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) 7rem 7rem 4rem;
  gap: var(--space-3);
  align-items: center;
  min-height: 46px;
  padding-inline: var(--space-3);
  border-bottom: 1px solid hsl(var(--border));
}

.table > div:first-child {
  min-height: 36px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 35%);
}

.table button {
  color: hsl(var(--primary));
  background: none;
  border: 0;
}

.ok {
  color: hsl(var(--success));
}

.description {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: var(--space-5) 0;
  border-block: 1px solid hsl(var(--border));
}

.description div,
.metrics div {
  padding: var(--space-4);
  border-right: 1px solid hsl(var(--border));
}

.description div:last-child,
.metrics div:last-child {
  border: 0;
}

.description dt {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.description dd {
  margin: 6px 0 0;
  font-weight: 650;
}

.activity p {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) 0;
  margin: 0;
  border-bottom: 1px solid hsl(var(--border));
}

.activity p span {
  color: hsl(var(--muted-foreground));
}

.settings-demo {
  max-width: 720px;
}

.settings-demo header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid hsl(var(--border));
}

.settings-demo h3 {
  margin: 0;
}

.settings-demo p {
  color: hsl(var(--muted-foreground));
}

.settings-demo > label {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid hsl(var(--border));
}

.settings-demo label span {
  font-weight: 650;
}

.settings-demo label small {
  display: block;
  margin-top: 4px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.settings-demo select,
.editor-demo input,
.editor-demo select {
  min-height: 36px;
  padding: 0 10px;
  color: inherit;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.validation {
  display: grid;
  gap: 3px;
  padding: var(--space-3);
  margin-top: var(--space-4);
  color: hsl(var(--success));
  background: hsl(var(--success) / 8%);
  border-left: 3px solid hsl(var(--success));
}

.settings-demo footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-4);
  color: hsl(var(--muted-foreground));
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: var(--space-5) 0;
  border-block: 1px solid hsl(var(--border));
}

.metrics span,
.metrics small {
  display: block;
  color: hsl(var(--muted-foreground));
}

.metrics strong {
  display: block;
  margin: 8px 0;
  font-size: 26px;
}

.editor-demo {
  display: grid;
  grid-template-rows: 42px 340px 30px;
  grid-template-columns: 150px minmax(0, 1fr) 190px;
  margin-top: var(--space-5);
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.editor-demo header {
  display: flex;
  grid-column: 1/-1;
  gap: 8px;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid hsl(var(--border));
}

.editor-demo header span {
  margin-left: auto;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.editor-demo button {
  padding: 6px 9px;
  color: inherit;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 5px;
}

.editor-demo button.primary {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.editor-demo aside,
.editor-demo section {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 12px;
  background: hsl(var(--sidebar));
}

.editor-demo aside {
  border-right: 1px solid hsl(var(--border));
}

.editor-demo section {
  border-left: 1px solid hsl(var(--border));
}

.editor-demo main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: center;
  padding: 28px;
  background: hsl(var(--background-deep));
}

.editor-demo main > span {
  grid-column: 1/-1;
  color: hsl(var(--muted-foreground));
}

.editor-demo main div {
  padding: 18px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
}

.editor-demo main strong,
.editor-demo main small {
  display: block;
}

.editor-demo main strong {
  margin-top: 8px;
  font-size: 20px;
}

.editor-demo section label {
  display: grid;
  gap: 4px;
  font-size: 11px;
}

.editor-demo footer {
  grid-column: 1/-1;
  padding: 7px 10px;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  border-top: 1px solid hsl(var(--border));
}

.feedback-demo > .segmented {
  margin-bottom: var(--space-5);
}

.skeleton {
  display: grid;
  gap: 10px;
  padding: var(--space-6);
}

.skeleton i {
  height: 12px;
  background: hsl(var(--muted));
  border-radius: 4px;
  animation: pulse 1.2s ease-in-out infinite alternate;
}

.skeleton i:nth-child(2) {
  width: 72%;
}

.skeleton i:nth-child(3) {
  width: 45%;
}

.skeleton span {
  color: hsl(var(--muted-foreground));
}

[data-density='compact'] .table > div {
  min-height: 36px;
}

[data-density='compact'] .stage {
  padding: 20px;
}

@keyframes pulse {
  to {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton i {
    animation: none;
  }
}

@media (width<=900px) {
  .workbench {
    grid-template-columns: 1fr;
  }

  .workbench > nav {
    display: flex;
    overflow: auto;
    border-right: 0;
    border-bottom: 1px solid hsl(var(--border));
  }

  .workbench > nav button {
    min-width: 170px;
  }

  .description,
  .metrics {
    grid-template-columns: 1fr 1fr;
  }

  .editor-demo {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .editor-demo section {
    display: none;
  }
}
</style>
