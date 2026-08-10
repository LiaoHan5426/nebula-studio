<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { NebulaPageHeader, NebulaTag } from '@nebula-studio/nebula-ui';

import {
  isSettingsOrgAdmin,
  isSettingsPlatformAdmin,
} from '@/shared/auth/access';

const platformAdmin = isSettingsPlatformAdmin();
const organizationAdmin = isSettingsOrgAdmin();
const tasks = computed(() =>
  [
    {
      to: '/organization/users',
      title: '检查成员与账号状态',
      description: '处理成员资料、异常状态和组织归属。',
      visible: organizationAdmin,
      scope: '组织',
    },
    {
      to: '/access/roles',
      title: '复核角色授权',
      description: '检查继承权限、冲突与实际权限来源。',
      visible: organizationAdmin,
      scope: '访问控制',
    },
    {
      to: '/platform/config',
      title: '审阅配置变更',
      description: '在提交前确认作用域、覆盖关系与潜在影响。',
      visible: platformAdmin,
      scope: '平台',
    },
    {
      to: '/platform/audit',
      title: '排查关键审计事件',
      description: '按操作者、实体和结果定位近期风险操作。',
      visible: platformAdmin,
      scope: '安全',
    },
  ].filter((task) => task.visible),
);
</script>

<template>
  <main class="governance-home">
    <NebulaPageHeader
      eyebrow="Governance workspace"
      title="设置治理工作台"
      description="从成员、授权、配置和审计待办开始，而不是在功能菜单中寻找任务。"
    />

    <section class="summary-grid" aria-label="治理范围">
      <article>
        <span>当前角色范围</span>
        <strong>{{ platformAdmin ? '平台管理员' : '组织管理员' }}</strong>
        <p>导航与可执行动作已按当前角色收敛。</p>
      </article>
      <article>
        <span>今日优先项</span>
        <strong>{{ tasks.length }}</strong>
        <p>逐项检查高影响治理对象。</p>
      </article>
      <article>
        <span>个人设置</span>
        <strong>始终可用</strong>
        <p>管理员仍可独立管理资料、会话、外观和语言。</p>
      </article>
    </section>

    <section class="task-panel">
      <header>
        <div>
          <span>Next actions</span>
          <h2>治理待办</h2>
        </div>
        <NebulaTag>{{ tasks.length }} 项</NebulaTag>
      </header>
      <div class="task-list">
        <RouterLink v-for="task in tasks" :key="task.to" :to="task.to">
          <div>
            <strong>{{ task.title }}</strong>
            <p>{{ task.description }}</p>
          </div>
          <NebulaTag>{{ task.scope }}</NebulaTag>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.governance-home {
  display: grid;
  gap: var(--space-5);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.summary-grid article,
.task-panel {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.summary-grid span,
.task-panel header span {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-grid strong {
  display: block;
  margin-top: var(--space-2);
  font-size: 24px;
}

.summary-grid p,
.task-list p {
  margin: var(--space-2) 0 0;
  color: hsl(var(--muted-foreground));
}

.task-panel header,
.task-list a {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.task-panel h2 {
  margin: var(--space-1) 0 0;
}

.task-list {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.task-list a {
  padding: var(--space-4);
  color: inherit;
  text-decoration: none;
  background: hsl(var(--muted) / 28%);
  border-radius: var(--radius-md);
}

.task-list a:hover {
  background: hsl(var(--muted) / 48%);
}

@media (width <= 800px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
