<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import {
  createSidebarState,
  provideLayoutContext,
} from '../../composables/useLayoutContext';
import { useLayoutPreferences } from '../../composables/useLayoutPreferences';
import NebulaShellHeader from './NebulaShellHeader.vue';
import NebulaShellSidebarFooter from './NebulaShellSidebarFooter.vue';
import NebulaShellTagsBar from './NebulaShellTagsBar.vue';
import NebulaPreferencesDrawer from '../preferences/NebulaPreferencesDrawer.vue';
import type {
  BreadcrumbSegment,
  ShellTagItem,
  NebulaThemeMode,
} from '../../types/layout';

const props = withDefaults(
  defineProps<{
    breadcrumbs?: BreadcrumbSegment[];
    showBreadcrumb?: boolean;
    showTagsBar?: boolean;
    tags?: ShellTagItem[];
    activeTagKey?: string;
    theme?: NebulaThemeMode;
    authUser?: string;
    showAuth?: boolean;
  }>(),
  {
    showBreadcrumb: true,
    showTagsBar: true,
    showAuth: true,
    tags: () => [],
  },
);

const emit = defineEmits<{
  'update:theme': [value: NebulaThemeMode];
  login: [];
  logout: [];
  lockScreen: [];
  refresh: [];
  tagActivate: [key: string];
  tagClose: [key: string];
  tagsCloseLeft: [];
  tagsCloseRight: [];
  tagsCloseOthers: [];
  tagsCloseAll: [];
  tagsRefresh: [];
  contentFullscreenChange: [value: boolean];
}>();

const preferencesOpen = defineModel<boolean>('preferencesOpen', {
  default: false,
});

const { preferences } = useLayoutPreferences();
const contentFullscreen = ref(false);

const sidebar = createSidebarState({
  collapsed: toRef(preferences, 'collapsed'),
  pinned: toRef(preferences, 'pinned'),
  expandOnHover: toRef(preferences, 'expandOnHover'),
});

provideLayoutContext({ mode: 'shell', sidebar });

const sidebarHoverExpanded = computed(() => sidebar.hoverExpanded.value);
const sidebarExpanded = computed(() => sidebar.effectiveExpanded.value);

const isFloating = computed(
  () =>
    preferences.collapsed &&
    !preferences.pinned &&
    sidebarHoverExpanded.value &&
    preferences.expandOnHover,
);

const shellClass = computed(() => ({
  'nebula-layout-shell': true,
  'is-sidebar-collapsed': preferences.collapsed,
  'is-sidebar-pinned': preferences.pinned,
  'is-sidebar-floating': isFloating.value,
  'is-content-compact': preferences.contentCompact,
  'is-content-fullscreen': contentFullscreen.value,
  'nebula-layout-transition': true,
}));

function toggleContentFullscreen() {
  contentFullscreen.value = !contentFullscreen.value;
  emit('contentFullscreenChange', contentFullscreen.value);
}

function openPreferences() {
  preferencesOpen.value = true;
}

function onPreferencesOpenChange(value: boolean) {
  preferencesOpen.value = value;
}

const resolvedShowTags = computed(
  () => props.showTagsBar !== false && preferences.showTagsBar,
);
const resolvedShowBreadcrumb = computed(
  () => props.showBreadcrumb !== false && preferences.showBreadcrumb,
);

const shellStyle = computed(() => {
  if (contentFullscreen.value) {
    return { '--shell-top': 'var(--layout-tags-height)' };
  }
  return {
    '--shell-top':
      resolvedShowTags.value && (props.tags?.length ?? 0) > 0
        ? 'calc(var(--layout-header-height) + var(--layout-tags-height))'
        : 'var(--layout-header-height)',
  };
});

function onThemeUpdate(theme: NebulaThemeMode) {
  preferences.themeMode = theme;
  emit('update:theme', theme);
}
</script>

<template>
  <div :class="shellClass" :style="shellStyle">
    <aside
      class="nebula-layout-shell__sidebar nebula-layout-transition"
      @mouseenter="sidebar.onSidebarEnter()"
      @mouseleave="sidebar.onSidebarLeave()"
    >
      <div class="nebula-layout-shell__sidebar-brand">
        <slot name="sidebar-brand" :expanded="sidebarExpanded" />
      </div>
      <nav class="nebula-layout-shell__sidebar-nav" aria-label="主导航">
        <slot name="sidebar" :expanded="sidebarExpanded" />
      </nav>
      <NebulaShellSidebarFooter />
    </aside>

    <div class="nebula-layout-shell__main">
      <NebulaShellHeader
        v-show="!contentFullscreen"
        :breadcrumbs="breadcrumbs"
        :show-breadcrumb="resolvedShowBreadcrumb"
        :theme="theme"
        :auth-user="authUser"
        :show-auth="showAuth"
        @update:theme="onThemeUpdate"
        @open-preferences="openPreferences"
        @login="emit('login')"
        @logout="emit('logout')"
        @lock-screen="emit('lockScreen')"
        @refresh="emit('refresh')"
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </NebulaShellHeader>

      <div class="nebula-layout-shell__content">
        <NebulaShellTagsBar
          v-if="resolvedShowTags && tags.length"
          :tags="tags"
          :active-key="activeTagKey || ''"
          :content-fullscreen="contentFullscreen"
          @activate="emit('tagActivate', $event)"
          @close="emit('tagClose', $event)"
          @close-left="emit('tagsCloseLeft')"
          @close-right="emit('tagsCloseRight')"
          @close-others="emit('tagsCloseOthers')"
          @close-all="emit('tagsCloseAll')"
          @refresh="emit('tagsRefresh')"
          @fullscreen="toggleContentFullscreen"
        />
        <slot />
      </div>
    </div>

    <NebulaPreferencesDrawer
      :open="preferencesOpen"
      :theme="theme"
      @update:open="onPreferencesOpenChange"
      @update:theme="onThemeUpdate"
    />

    <button
      v-if="contentFullscreen"
      type="button"
      class="nebula-layout-shell__float-prefs"
      title="偏好设置"
      aria-label="偏好设置"
      @click="openPreferences"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        />
      </svg>
    </button>
  </div>
</template>
