<script setup lang="ts">
import type { SettingsAccess } from '@/shared/auth/access';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import {
  NebulaSettingsLayout,
  useShellHosted,
} from '@nebula-studio/nebula-layout';

import { canAccessSettings } from '@/shared/auth/access';

const route = useRoute();
const { t, te } = useI18n();
const { isShellHosted } = useShellHosted();

interface SettingsNavGroup {
  label: string;
  access: SettingsAccess;
  items: Array<{ access?: SettingsAccess; label: string; to: string }>;
}

const allGroups = computed<SettingsNavGroup[]>(() => [
  {
    label: t('nav.governance'),
    access: 'organization',
    items: [{ to: '/governance', label: t('nav.governanceHome') }],
  },
  {
    label: t('nav.personal'),
    access: 'personal',
    items: [
      { to: '/profile', label: t('nav.profile') },
      { to: '/sessions', label: t('nav.sessions') },
      { to: '/appearance', label: t('nav.appearance') },
      { to: '/language', label: t('nav.language') },
    ],
  },
  {
    label: t('nav.org'),
    access: 'organization',
    items: [
      { to: '/organization/users', label: t('nav.users') },
      { to: '/organization/structure', label: t('nav.structure') },
    ],
  },
  {
    label: t('nav.access'),
    access: 'organization',
    items: [
      { to: '/access/roles', label: t('nav.roles') },
      {
        to: '/access/permissions',
        label: t('nav.permissions'),
        access: 'platform',
      },
    ],
  },
  {
    label: t('nav.runtime'),
    access: 'platform',
    items: [
      { to: '/platform/apps', label: t('nav.apps') },
      { to: '/platform/config', label: t('nav.config') },
      { to: '/platform/audit', label: t('nav.logs') },
    ],
  },
]);

const navGroups = computed(() =>
  allGroups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessSettings(item.access ?? group.access),
      ),
    }))
    .filter((group) => group.items.length > 0),
);

const pageKey = computed(() => String(route.name ?? ''));
const pageTitle = computed(() =>
  te(`pages.${pageKey.value}.title`)
    ? t(`pages.${pageKey.value}.title`)
    : t('pages.fallbackTitle'),
);
const pageDescription = computed(() =>
  te(`pages.${pageKey.value}.description`)
    ? t(`pages.${pageKey.value}.description`)
    : t('pages.fallbackDescription'),
);
</script>

<template>
  <NebulaSettingsLayout
    :embedded="isShellHosted"
    density="compact"
    content-width="wide"
    :title="pageTitle"
    :description="pageDescription"
    :eyebrow="t('nav.eyebrow')"
    :navigation-label="t('nav.label')"
    class="settings-root"
  >
    <template #navigation>
      <div class="settings-nav__brand">
        <span>NEBULA STUDIO</span>
        <strong>{{ t('nav.brand') }}</strong>
      </div>
      <nav class="settings-nav" :aria-label="t('nav.categories')">
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
