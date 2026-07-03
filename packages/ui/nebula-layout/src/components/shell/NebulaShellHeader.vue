<script setup lang="ts">
import { NebulaIconButton, NebulaThemeToggle } from '@nebula-studio/nebula-ui';
import type { NebulaThemeMode } from '@nebula-studio/nebula-ui';

import NebulaBreadcrumb from '../chrome/NebulaBreadcrumb.vue';
import NebulaUserMenu from '../chrome/NebulaUserMenu.vue';
import type { BreadcrumbSegment } from '../../types/layout';

defineProps<{
  breadcrumbs?: BreadcrumbSegment[];
  showBreadcrumb?: boolean;
  theme?: NebulaThemeMode;
  authUser?: string;
  showAuth?: boolean;
}>();

const emit = defineEmits<{
  'update:theme': [value: NebulaThemeMode];
  openPreferences: [];
  login: [];
  logout: [];
  lockScreen: [];
  refresh: [];
}>();
</script>

<template>
  <header class="nebula-layout-shell__header">
    <div class="nebula-layout-shell__header-left">
      <NebulaIconButton title="刷新" aria-label="刷新" @click="emit('refresh')">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="18"
          height="18"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path
            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          />
        </svg>
      </NebulaIconButton>

      <NebulaBreadcrumb
        v-if="showBreadcrumb !== false && breadcrumbs?.length"
        :items="breadcrumbs"
      />
    </div>

    <div class="nebula-layout-shell__header-actions">
      <slot name="actions" />

      <button type="button" class="nebula-header-search" title="搜索 Ctrl K">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>搜索</span>
        <span class="nebula-header-search__kbd">Ctrl K</span>
      </button>

      <div class="nebula-header-tool-group">
        <NebulaIconButton
          title="偏好设置"
          aria-label="偏好设置"
          @click.stop="emit('openPreferences')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="18"
            height="18"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H5a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            />
          </svg>
        </NebulaIconButton>

        <NebulaThemeToggle
          v-if="theme"
          :theme="theme"
          @update:theme="emit('update:theme', $event)"
        />
      </div>

      <NebulaUserMenu
        v-if="showAuth && authUser"
        :user="authUser"
        @logout="emit('logout')"
        @lock-screen="emit('lockScreen')"
      />
      <button
        v-else-if="showAuth"
        type="button"
        class="nebula-header-login"
        @click="emit('login')"
      >
        登录
      </button>
    </div>
  </header>
</template>

<style scoped>
.nebula-header-login {
  padding: 6px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted) / 60%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
</style>
