<script setup lang="ts">
import type { SettingsAccess } from '@/shared/auth/access';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink, RouterView } from 'vue-router';

import {
  NebulaSettingsLayout,
  useShellHosted,
} from '@nebula-studio/nebula-layout';

import { canAccessSettings } from '@/shared/auth/access';

const { t } = useI18n();
const { isShellHosted } = useShellHosted();
const navQuery = ref('');

interface SettingsNavGroup {
  label: string;
  access: SettingsAccess;
  items: Array<{ access?: SettingsAccess; label: string; to: string }>;
}

const allGroups = computed<SettingsNavGroup[]>(() => [
  {
    label: t('nav.workspace'),
    access: 'personal',
    items: [{ to: '/overview', label: t('nav.overview') }],
  },
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
      items: group.items.filter((item) => {
        if (!canAccessSettings(item.access ?? group.access)) return false;
        const query = navQuery.value.trim().toLocaleLowerCase();
        return !query || item.label.toLocaleLowerCase().includes(query);
      }),
    }))
    .filter((group) => group.items.length > 0),
);
</script>

<template>
  <NebulaSettingsLayout
    :embedded="isShellHosted"
    density="compact"
    content-width="wide"
    :navigation-label="t('nav.label')"
    class="settings-root"
  >
    <template #navigation>
      <div class="settings-nav__brand">
        <span>NEBULA STUDIO</span>
        <strong>{{ t('nav.brand') }}</strong>
      </div>
      <label class="settings-nav__search">
        <span class="settings-nav__search-icon" aria-hidden="true">⌕</span>
        <input
          v-model="navQuery"
          type="search"
          autocomplete="off"
          :placeholder="t('common.query')"
          :aria-label="t('common.query')"
        />
      </label>
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

.settings-nav__search {
  position: relative;
  display: block;
  margin-top: 12px;
}

.settings-nav__search input {
  width: 100%;
  min-height: 40px;
  padding: 8px 10px 8px 34px;
  font: inherit;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  outline: 0;
}

.settings-nav__search input:focus {
  border-color: hsl(var(--primary) / 65%);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 12%);
}

.settings-nav__search-icon {
  position: absolute;
  top: 9px;
  left: 11px;
  z-index: 1;
  color: hsl(var(--muted-foreground));
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
  position: relative;
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

.settings-nav__item.is-active::before {
  position: absolute;
  top: 9px;
  bottom: 9px;
  left: 0;
  width: 3px;
  content: '';
  background: hsl(var(--primary));
  border-radius: 999px;
}
</style>
