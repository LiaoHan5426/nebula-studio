<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaAdminContent,
  NebulaAdminSubNav,
  useShellHosted,
} from '@nebula-studio/nebula-layout';
import type { SubNavItem } from '@nebula-studio/nebula-layout';

import AppHeader from '@/app/AppHeader.vue';
import { useAuth } from '@/shared/composables/useAuth';

const { isShellHosted } = useShellHosted();
const { isPlatformAdmin } = useAuth();

// 当前所在端：admin=管理端, user=使用端
const currentSide = ref<'user' | 'admin'>('admin');

interface NavChild {
  to: string;
  label: string;
}

interface NavItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: NavChild[];
}

/** 平台管理员：全量平台配置 */
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

/** 普通对接用户：自行管理插件/服务（启用与发布需审批） */
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

const expandedMenus = ref<Set<string>>(new Set(['integration-core']));

function toggleMenu(key: string) {
  if (expandedMenus.value.has(key)) {
    expandedMenus.value.delete(key);
  } else {
    expandedMenus.value.add(key);
  }
}

function isExpanded(key: string) {
  return expandedMenus.value.has(key);
}

const embeddedSubNavItems = computed<SubNavItem[]>(() => {
  if (currentSide.value === 'user') {
    return userNavItems
      .filter((item): item is typeof item & { to: string } => !!item.to)
      .map((item) => ({
        key: item.key,
        label: item.label,
        to: item.to,
      }));
  }
  const items: SubNavItem[] = [];
  for (const item of activeAdminNavItems.value) {
    if (item.children) {
      for (const child of item.children) {
        items.push({ key: child.to, label: child.label, to: child.to });
      }
    } else if (item.to) {
      items.push({ key: item.key, label: item.label, to: item.to });
    }
  }
  return items;
});
</script>

<template>
  <NebulaAdminContent v-if="isShellHosted">
    <template #subnav>
      <div class="integration-embed-subnav">
        <div
          class="integration-embed-side-toggle"
          role="tablist"
          aria-label="端切换"
        >
          <button
            type="button"
            role="tab"
            class="integration-embed-side-btn"
            :class="{ active: currentSide === 'admin' }"
            @click="currentSide = 'admin'"
          >
            管理端
          </button>
          <button
            type="button"
            role="tab"
            class="integration-embed-side-btn"
            :class="{ active: currentSide === 'user' }"
            @click="currentSide = 'user'"
          >
            使用端
          </button>
        </div>
        <NebulaAdminSubNav :items="embeddedSubNavItems" :max-visible="8" />
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

        <div class="app-layout__side-toggle" role="tablist" aria-label="端切换">
          <button
            type="button"
            role="tab"
            class="side-toggle-btn"
            :class="{ active: currentSide === 'admin' }"
            :aria-selected="currentSide === 'admin'"
            @click="currentSide = 'admin'"
          >
            管理端
          </button>
          <button
            type="button"
            role="tab"
            class="side-toggle-btn"
            :class="{ active: currentSide === 'user' }"
            :aria-selected="currentSide === 'user'"
            @click="currentSide = 'user'"
          >
            使用端
          </button>
        </div>
      </div>

      <nav v-if="currentSide === 'admin'" class="app-layout__nav">
        <template v-for="item in activeAdminNavItems" :key="item.key">
          <div v-if="item.children" class="nav-group">
            <button
              class="nav-group__header"
              :class="{ expanded: isExpanded(item.key) }"
              @click="toggleMenu(item.key)"
            >
              <span class="nav-group__icon">{{ item.icon }}</span>
              <span class="nav-group__label">{{ item.label }}</span>
              <span class="nav-group__arrow">{{
                isExpanded(item.key) ? '▼' : '▶'
              }}</span>
            </button>
            <div v-show="isExpanded(item.key)" class="nav-group__children">
              <RouterLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                class="nav-child"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </div>
          <RouterLink v-else :to="item.to!" class="app-layout__nav-link">
            <span class="nav-link__icon">{{ item.icon ?? ' ' }}</span>
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <nav v-else class="app-layout__nav">
        <RouterLink
          v-for="item in userNavItems"
          :key="item.key"
          :to="item.to!"
          class="app-layout__nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
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
.app-layout {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.app-layout--embedded {
  background: transparent;
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

.app-layout--embedded .app-layout__sidebar {
  width: 200px;
  background: hsl(var(--background));
  border-right-color: hsl(var(--border) / 60%);
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
  background: hsl(var(--muted) / 60%);
  border-radius: 8px;
}

.side-toggle-btn {
  flex: 1;
  min-width: 0;
  padding: 7px 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s,
    box-shadow 0.15s;
}

.side-toggle-btn:hover {
  color: hsl(var(--foreground));
}

.side-toggle-btn.active {
  color: hsl(var(--primary));
  background: hsl(var(--background));
  box-shadow: 0 1px 2px hsl(var(--foreground) / 8%);
}

.app-layout__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
  padding: 12px 8px;
  overflow-y: auto;
}

.app-layout__nav-link {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 9px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.15s;
}

.app-layout__nav-link:hover {
  background: hsl(var(--muted));
}

.app-layout__nav-link.router-link-active {
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.nav-group {
  display: flex;
  flex-direction: column;
}

.nav-group__header {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: background 0.15s;
}

.nav-group__header:hover {
  background: hsl(var(--muted));
}

.nav-group__header.expanded {
  color: hsl(var(--primary));
}

.nav-group__icon {
  flex-shrink: 0;
  width: 16px;
  font-size: 14px;
  text-align: center;
}

.nav-group__label {
  flex: 1;
}

.nav-group__arrow {
  font-size: 10px;
  color: hsl(var(--muted-foreground));
}

.nav-group__children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 16px;
  margin-top: 2px;
}

.nav-child {
  display: block;
  padding: 7px 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s;
}

.nav-child:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.nav-child.router-link-active {
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
}

.nav-link__icon {
  flex-shrink: 0;
  width: 16px;
  font-size: 14px;
  text-align: center;
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
  padding: 0 4px 4px;
  overflow: auto;
}

.integration-embed-subnav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.integration-embed-side-toggle {
  display: flex;
  gap: 6px;
  padding: 8px 12px 0;
}

.integration-embed-side-btn {
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.integration-embed-side-btn.active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary) / 40%);
}
</style>
