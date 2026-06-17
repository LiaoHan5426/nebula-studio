<script setup lang="ts">
import { computed } from 'vue';

import AppHeader from '@/app/AppHeader.vue';
import { isIntegrationShellEmbed } from '@/shared/composables/useShellEmbed';

const isShellHosted = computed(() => isIntegrationShellEmbed());

const navItems = [
  { to: '/connectors', label: '连接器' },
  { to: '/datasources', label: '数据源' },
  { to: '/subscriptions', label: '库表订阅' },
  { to: '/interfaces', label: '接口管理' },
  { to: '/flows', label: '流程定义' },
  { to: '/gateway', label: '接口网关' },
];
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--embedded': isShellHosted }">
    <aside class="app-layout__sidebar">
      <div v-if="!isShellHosted" class="app-layout__brand">
        <h1 class="app-layout__title">集成平台</h1>
        <p class="app-layout__subtitle">连接器 · 订阅 · 接口 · 流程</p>
      </div>
      <nav class="app-layout__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
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
  background: hsl(var(--background));
  color: hsl(var(--foreground));
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

.app-layout__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
}

.app-layout__nav-link {
  display: block;
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

.app-layout__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.app-layout__content {
  flex: 1;
  overflow: auto;
  padding: 0 4px 4px;
}

.app-layout--embedded .app-layout__content {
  padding: 0 16px 16px;
}
</style>
