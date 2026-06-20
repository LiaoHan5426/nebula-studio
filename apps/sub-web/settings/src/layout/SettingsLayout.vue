<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  NebulaAdminContent,
  NebulaAdminLayout,
  NebulaAdminSubNav,
  useShellHosted,
} from '@nebula-studio/nebula-layout';
import type { SubNavItem } from '@nebula-studio/nebula-layout';

const route = useRoute();
const { isShellHosted } = useShellHosted();

const navItems = [
  { to: '/users', label: '用户管理' },
  { to: '/roles', label: '角色管理' },
  { to: '/permissions', label: '权限管理' },
  { to: '/organizations', label: '组织管理' },
  { to: '/apps', label: '应用管理' },
  { to: '/logs', label: '日志管理' },
  { to: '/appearance', label: '外观设置' },
] as const;

const subNavItems = computed<SubNavItem[]>(() =>
  navItems.map((item) => ({
    key: item.to,
    label: item.label,
    to: item.to,
  })),
);

const pageTitle = computed(() => {
  const match = navItems.find((item) => route.path.startsWith(item.to));
  return match?.label ?? '系统设置';
});
</script>

<template>
  <NebulaAdminContent v-if="isShellHosted" compact>
    <template #subnav>
      <NebulaAdminSubNav :items="subNavItems" />
    </template>
    <RouterView />
  </NebulaAdminContent>

  <NebulaAdminLayout v-else title="系统设置" subtitle="Settings Admin">
    <template #sidebar>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="settings-nav__item"
        active-class="is-active"
      >
        {{ item.label }}
      </RouterLink>
    </template>
    <template #header>
      <h2>{{ pageTitle }}</h2>
    </template>
    <RouterView />
  </NebulaAdminLayout>
</template>

<style lang="scss" scoped>
.settings-nav__item {
  display: block;
  padding: 10px 12px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: 8px;
}

.settings-nav__item:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 55%);
}

.settings-nav__item.is-active {
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--primary) / 14%);
}

h2 {
  margin: 0;
  font-size: 20px;
}
</style>
