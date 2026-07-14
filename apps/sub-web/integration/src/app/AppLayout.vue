<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaAdminContent,
  NebulaAdminVerticalNav,
  useShellHosted,
} from '@nebula-studio/nebula-layout';
import type { NavItem } from '@nebula-studio/nebula-layout';
import { NebulaButton, NebulaButtonGroup } from '@nebula-studio/nebula-ui';

import AppHeader from '@/app/AppHeader.vue';
import { useAuth } from '@/shared/composables/useAuth';

const { isShellHosted } = useShellHosted();
const { isPlatformAdmin } = useAuth();

const currentSide = ref<'user' | 'admin'>('admin');

const platformAdminNavItems: NavItem[] = [
  {
    key: 'plugins',
    label: '插件管理',
    icon: '🔌',
    children: [
      { to: '/plugins/database', label: '数据库适配插件' },
      { to: '/plugins/protocol', label: '协议插件' },
      { to: '/plugins/preprocessor', label: '前置处理器插件' },
      { to: '/plugins/postprocessor', label: '后置处理器插件' },
      { to: '/plugins/aggregator', label: '聚合插件' },
      { to: '/plugins/dispatcher', label: '分发插件' },
      { to: '/plugins/transformer', label: '转换插件' },
      { to: '/plugins/market', label: '插件市场' },
    ],
  },
  {
    key: 'tenant',
    label: '租户管理',
    icon: '🏢',
    to: '/tenant',
  },
  {
    key: 'service',
    label: '服务管理',
    icon: '⚙️',
    children: [
      { to: '/service/register', label: '服务注册' },
      { to: '/service/publish', label: '服务发布' },
      { to: '/service/approvals', label: '发布审批' },
      { to: '/service/releases', label: '发布管理' },
      { to: '/service/versions', label: '版本快照' },
      { to: '/service/authorize', label: '服务授权' },
      { to: '/service/subscription-requests', label: '订阅审批' },
      { to: '/service/governance', label: '服务治理' },
      { to: '/service/test', label: '服务测试' },
    ],
  },
  {
    key: 'integration-core',
    label: '集成核心',
    icon: '🔧',
    children: [
      { to: '/datasources', label: '数据源' },
      { to: '/flows', label: '流程定义' },
      { to: '/dag', label: 'DAG 编排' },
      { to: '/tasks', label: '任务调度' },
      { to: '/executor/routes', label: 'Executor 路由' },
    ],
  },
  {
    key: 'statistics',
    label: '服务统计',
    icon: '📊',
    children: [
      { to: '/statistics/log-query', label: '日志查询' },
      { to: '/statistics/log-stats', label: '日志统计' },
      { to: '/statistics/topology', label: '服务拓扑' },
    ],
  },
];

const integratorAdminNavItems: NavItem[] = [
  {
    key: 'plugins',
    label: '插件管理',
    icon: '🔌',
    children: [
      { to: '/plugins/database', label: '数据库适配插件' },
      { to: '/plugins/protocol', label: '协议插件' },
      { to: '/plugins/preprocessor', label: '前置处理器插件' },
      { to: '/plugins/postprocessor', label: '后置处理器插件' },
      { to: '/plugins/aggregator', label: '聚合插件' },
      { to: '/plugins/dispatcher', label: '分发插件' },
      { to: '/plugins/transformer', label: '转换插件' },
      { to: '/plugins/market', label: '插件市场' },
    ],
  },
  {
    key: 'tenant',
    label: '我的租户',
    icon: '🏢',
    to: '/tenant',
  },
  {
    key: 'service',
    label: '服务管理',
    icon: '⚙️',
    children: [
      { to: '/service/register', label: '服务注册' },
      { to: '/service/publish', label: '服务发布' },
      { to: '/service/approvals', label: '发布审批' },
      { to: '/service/releases', label: '发布管理' },
      { to: '/service/versions', label: '版本快照' },
      { to: '/service/authorize', label: '服务授权' },
      { to: '/service/governance', label: '服务治理' },
      { to: '/service/test', label: '服务测试' },
    ],
  },
  {
    key: 'integration-core',
    label: '集成核心',
    icon: '🔧',
    children: [
      { to: '/datasources', label: '数据源' },
      { to: '/flows', label: '流程定义' },
      { to: '/dag', label: 'DAG 编排' },
      { to: '/tasks', label: '任务调度' },
      { to: '/executor/routes', label: 'Executor 路由' },
    ],
  },
  {
    key: 'statistics',
    label: '服务统计',
    icon: '📊',
    children: [
      { to: '/statistics/log-query', label: '日志查询' },
      { to: '/statistics/log-stats', label: '日志统计' },
      { to: '/statistics/topology', label: '服务拓扑' },
    ],
  },
];

const userNavItems: NavItem[] = [
  {
    key: 'subscriptions',
    label: '库表订阅',
    to: '/subscriptions',
  },
  {
    key: 'my-services',
    label: '我的服务',
    to: '/my-interfaces',
  },
];

const activeAdminNavItems = computed(() =>
  isPlatformAdmin.value ? platformAdminNavItems : integratorAdminNavItems,
);

const activeNavItems = computed(() =>
  currentSide.value === 'user' ? userNavItems : activeAdminNavItems.value,
);

const expandedMenus = ref<Set<string>>(new Set(['integration-core']));
</script>

<template>
  <NebulaAdminContent
    v-if="isShellHosted"
    horizontal
    class="integration-embed-root"
  >
    <template #subnav>
      <div class="integration-subnav">
        <NebulaButtonGroup class="integration-subnav__toggle">
          <NebulaButton
            variant="ghost"
            :active="currentSide === 'admin'"
            @click="currentSide = 'admin'"
          >
            管理端
          </NebulaButton>
          <NebulaButton
            variant="ghost"
            :active="currentSide === 'user'"
            @click="currentSide = 'user'"
          >
            使用端
          </NebulaButton>
        </NebulaButtonGroup>
        <NebulaAdminVerticalNav
          v-model="expandedMenus"
          :items="activeNavItems"
        />
      </div>
    </template>
    <slot />
  </NebulaAdminContent>

  <div v-else class="app-layout">
    <aside class="app-layout__sidebar">
      <div class="app-layout__sidebar-head">
        <div class="app-layout__brand">
          <h1 class="app-layout__title">集成平台</h1>
          <p class="app-layout__subtitle">插件 · 订阅 · 服务 · 流程</p>
        </div>

        <NebulaButtonGroup class="app-layout__side-toggle">
          <NebulaButton
            variant="ghost"
            :active="currentSide === 'admin'"
            @click="currentSide = 'admin'"
          >
            管理端
          </NebulaButton>
          <NebulaButton
            variant="ghost"
            :active="currentSide === 'user'"
            @click="currentSide = 'user'"
          >
            使用端
          </NebulaButton>
        </NebulaButtonGroup>
      </div>

      <NebulaAdminVerticalNav
        v-model="expandedMenus"
        :items="activeNavItems"
        class="app-layout__nav"
      />
    </aside>
    <div class="app-layout__main">
      <AppHeader />
      <main class="app-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.integration-embed-root {
  height: 100%;
  min-height: 0;
}

.integration-subnav {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.integration-subnav__toggle {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid hsl(var(--border) / 60%);
}

.integration-subnav__toggle [data-button-group-item] {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
}

.app-layout {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.app-layout__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 220px;
  min-height: 0;
  overflow: hidden;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
}

.app-layout__sidebar-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.app-layout__brand {
  min-width: 0;
}

.app-layout__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.app-layout__subtitle {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: hsl(var(--muted-foreground));
}

.app-layout__side-toggle {
  display: flex;
  gap: 4px;
  padding: 3px;
}

.app-layout__side-toggle [data-button-group-item] {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
}

.app-layout__nav {
  flex: 1;
  min-height: 0;
}

.app-layout__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.app-layout__content {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 20px;
  overflow: auto;
}
</style>
