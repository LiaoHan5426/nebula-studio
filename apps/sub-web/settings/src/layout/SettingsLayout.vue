<script setup lang="ts">
import type { SettingsAccess } from '@/shared/auth/access';

import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import {
  NebulaSettingsLayout,
  useShellHosted,
} from '@nebula-studio/nebula-layout';

import { canAccessSettings } from '@/shared/auth/access';

const route = useRoute();
const { isShellHosted } = useShellHosted();

interface SettingsNavGroup {
  label: string;
  access: SettingsAccess;
  items: Array<{ access?: SettingsAccess; label: string; to: string }>;
}

const allGroups: SettingsNavGroup[] = [
  {
    label: '治理工作台',
    access: 'organization',
    items: [{ to: '/governance', label: '待办与摘要' }],
  },
  {
    label: '个人设置',
    access: 'personal',
    items: [
      { to: '/profile', label: '个人资料' },
      { to: '/sessions', label: '登录会话' },
      { to: '/appearance', label: '外观设置' },
      { to: '/language', label: '语言与区域' },
    ],
  },
  {
    label: '组织与成员',
    access: 'organization',
    items: [
      { to: '/organization/users', label: '成员管理' },
      { to: '/organization/structure', label: '组织结构' },
    ],
  },
  {
    label: '访问控制',
    access: 'organization',
    items: [
      { to: '/access/roles', label: '角色管理' },
      {
        to: '/access/permissions',
        label: '权限矩阵',
        access: 'platform',
      },
    ],
  },
  {
    label: '应用与运行',
    access: 'platform',
    items: [
      { to: '/platform/apps', label: '应用管理' },
      { to: '/platform/config', label: '配置管理' },
      { to: '/platform/audit', label: '审计日志' },
    ],
  },
];

const navGroups = computed(() =>
  allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessSettings(item.access ?? group.access),
      ),
    }))
    .filter((group) => group.items.length > 0),
);

const pageTitle = computed(() => String(route.meta.title ?? '设置中心'));

const pageDescription = computed(
  () =>
    (route.meta.description as string | undefined) ??
    '管理个人偏好、组织访问和平台运行配置。',
);
</script>

<template>
  <NebulaSettingsLayout
    :embedded="isShellHosted"
    density="compact"
    content-width="wide"
    :title="pageTitle"
    :description="pageDescription"
    eyebrow="设置"
    navigation-label="设置导航"
    class="settings-root"
  >
    <template #navigation>
      <div class="settings-nav__brand">
        <span>NEBULA STUDIO</span>
        <strong>设置中心</strong>
      </div>
      <nav class="settings-nav" aria-label="设置分类">
        <section
          v-for="group in navGroups"
          :key="group.label"
          class="settings-nav__group"
        >
          <h2>{{ group.label }}</h2>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="settings-nav__item"
            active-class="is-active"
          >
            {{ item.label }}
          </RouterLink>
        </section>
      </nav>
    </template>
    <RouterView />
  </NebulaSettingsLayout>
</template>

<style lang="scss" scoped>
.settings-root {
  height: 100%;
  min-height: 0;
}

.settings-nav__brand {
  display: grid;
  gap: 3px;
  padding: 2px 4px 16px;
  border-bottom: 1px solid hsl(var(--border) / 68%);
}

.settings-nav__brand span {
  font-size: 10px;
  font-weight: 700;
  color: hsl(var(--primary));
  letter-spacing: 0.1em;
}

.settings-nav__brand strong {
  font-size: 17px;
}

.settings-nav {
  display: grid;
  gap: 16px;
  margin-top: 12px;
}

.settings-nav__group {
  display: grid;
  gap: 4px;
}

.settings-nav__group h2 {
  padding: 0 12px;
  margin: 0 0 3px;
  font-size: 10px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

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
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 14%);
}
</style>
