<script setup lang="ts">
import { computed, ref } from 'vue';

import AppHeader from '@/app/AppHeader.vue';
import { isIntegrationShellEmbed } from '@/shared/composables/useShellEmbed';

const isShellHosted = computed(() => isIntegrationShellEmbed());

// 当前所在端：user=用户端, admin=管理端
const currentSide = ref<'user' | 'admin'>('admin');

// 展开状态
const expandedMenus = ref<Set<string>>(new Set());

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

// 管理端菜单
const adminNavItems = [
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
  {
    key: 'datasources',
    label: '数据源',
    to: '/datasources',
  },
  {
    key: 'flows',
    label: '流程定义',
    to: '/flows',
  },
  {
    key: 'gateway',
    label: '接口网关',
    to: '/gateway',
  },
];

// 用户端菜单
const userNavItems = [
  {
    key: 'subscriptions',
    label: '库表订阅',
    to: '/subscriptions',
  },
  {
    key: 'my-interfaces',
    label: '我的接口',
    to: '/my-interfaces',
  },
];
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--embedded': isShellHosted }">
    <aside class="app-layout__sidebar">
      <div v-if="!isShellHosted" class="app-layout__brand">
        <h1 class="app-layout__title">集成平台</h1>
        <p class="app-layout__subtitle">连接器 · 订阅 · 接口 · 流程</p>
      </div>

      <!-- 端切换 -->
      <div class="app-layout__side-toggle">
        <button
          class="side-toggle-btn"
          :class="{ active: currentSide === 'admin' }"
          @click="currentSide = 'admin'"
        >
          管理端
        </button>
        <button
          class="side-toggle-btn"
          :class="{ active: currentSide === 'user' }"
          @click="currentSide = 'user'"
        >
          用户端
        </button>
      </div>

      <!-- 管理端菜单 -->
      <nav v-if="currentSide === 'admin'" class="app-layout__nav">
        <template v-for="item in adminNavItems" :key="item.key">
          <!-- 有子菜单的项 -->
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
          <!-- 无子菜单的项 -->
          <RouterLink v-else :to="item.to!" class="app-layout__nav-link">
            <span v-if="item.icon" class="nav-link__icon">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <!-- 用户端菜单 -->
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
  width: 100%;
  height: 100%;
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
  width: 200px;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
}

.app-layout--embedded .app-layout__sidebar {
  width: 168px;
  background: hsl(var(--background));
  border-right-color: hsl(var(--border) / 60%);
}

.app-layout__brand {
  padding: 20px 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.app-layout__title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 700;
}

.app-layout__subtitle {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 端切换按钮 */
.app-layout__side-toggle {
  display: flex;
  gap: 4px;
  padding: 12px 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.side-toggle-btn {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: all 0.15s;
}

.side-toggle-btn:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.side-toggle-btn.active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary) / 30%);
}

.app-layout__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
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

/* 菜单组 */
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
  font-size: 14px;
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
  font-size: 14px;
}

.app-layout__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.app-layout__content {
  flex: 1;
  padding: 0 4px 4px;
  overflow: auto;
}

.app-layout--embedded .app-layout__content {
  padding: 0 16px 16px;
}
</style>
