<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  NebulaSettingsLayout,
  useShellHosted,
} from '@nebula-studio/nebula-layout';

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
  { to: '/config', label: '配置管理' },
] as const;

const pageTitle = computed(() => {
  const match = navItems.find((item) => route.path.startsWith(item.to));
  return match?.label ?? '系统设置';
});

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
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="settings-nav__item"
          active-class="is-active"
        >
          {{ item.label }}
        </RouterLink>
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
  gap: 4px;
  margin-top: 12px;
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
