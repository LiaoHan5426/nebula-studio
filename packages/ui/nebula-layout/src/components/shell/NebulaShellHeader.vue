<script setup lang="ts">
import type { BreadcrumbSegment, NebulaThemeMode } from '../../types/layout';

import { NebulaButton, NebulaIcon } from '@nebula-studio/nebula-ui';

import NebulaBreadcrumb from '../chrome/NebulaBreadcrumb.vue';
import NebulaUserMenu from '../chrome/NebulaUserMenu.vue';

defineProps<{
  authUser?: string;
  breadcrumbs?: BreadcrumbSegment[];
  showAuth?: boolean;
  showBreadcrumb?: boolean;
  showRefresh?: boolean;
  theme?: NebulaThemeMode;
}>();

const emit = defineEmits<{
  lockScreen: [];
  login: [];
  logout: [];
  openPreferences: [];
  refresh: [];
  'update:theme': [value: NebulaThemeMode];
}>();
</script>

<template>
  <header class="nebula-layout-shell__header">
    <div class="nebula-layout-shell__header-left">
      <NebulaButton
        v-if="showRefresh !== false"
        icon
        variant="ghost"
        title="刷新当前页"
        aria-label="刷新当前页"
        @click="emit('refresh')"
      >
        <NebulaIcon icon="refresh" :size="16" />
      </NebulaButton>

      <NebulaBreadcrumb
        v-if="showBreadcrumb !== false && breadcrumbs?.length"
        :items="breadcrumbs"
      />
    </div>

    <div class="nebula-layout-shell__header-actions">
      <slot name="actions"></slot>

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
        <NebulaButton
          icon
          title="偏好设置"
          aria-label="偏好设置"
          @click.stop="emit('openPreferences')"
        >
          <svg
            class="nebula-header-gear-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.76 6.76 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.93 6.93 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NebulaButton>

        <NebulaButton
          v-if="theme"
          icon
          variant="ghost"
          :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
        >
          <svg
            v-if="theme === 'dark'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="18"
            height="18"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="18"
            height="18"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </NebulaButton>
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

.nebula-header-gear-icon {
  display: block;
  flex-shrink: 0;
  overflow: visible;
}
</style>
