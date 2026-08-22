<script setup lang="ts">
import type {
  BreadcrumbSegment,
  NebulaThemeMode,
  ShellTagItem,
} from '../../types/layout';

import { computed, ref, toRef } from 'vue';

import {
  createSidebarState,
  provideLayoutContext,
} from '../../composables/useLayoutContext';
import { useLayoutPreferences } from '../../composables/useLayoutPreferences';
import NebulaPreferencesDrawer from '../preferences/NebulaPreferencesDrawer.vue';
import NebulaShellHeader from './NebulaShellHeader.vue';
import NebulaShellSidebarFooter from './NebulaShellSidebarFooter.vue';
import NebulaShellTagsBar from './NebulaShellTagsBar.vue';

const props = withDefaults(
  defineProps<{
    activeTagKey?: string;
    authUser?: string;
    breadcrumbs?: BreadcrumbSegment[];
    showAuth?: boolean;
    showBreadcrumb?: boolean;
    showTagsBar?: boolean;
    tags?: ShellTagItem[];
    theme?: NebulaThemeMode;
  }>(),
  {
    showBreadcrumb: true,
    showTagsBar: true,
    showAuth: true,
    tags: () => [],
  },
);

const emit = defineEmits<{
  contentFullscreenChange: [value: boolean];
  lockScreen: [];
  login: [];
  logout: [];
  refresh: [];
  tagActivate: [key: string];
  tagClose: [key: string];
  tagsCloseAll: [];
  tagsCloseLeft: [];
  tagsCloseOthers: [];
  tagsCloseRight: [];
  tagsRefresh: [];
  'update:theme': [value: NebulaThemeMode];
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
  <div
    :class="shellClass"
    :style="shellStyle"
    data-nebula-surface="shell"
    data-nebula-density="compact"
  >
    <aside
      class="nebula-layout-shell__sidebar nebula-layout-transition"
      @mouseenter="sidebar.onSidebarEnter()"
      @mouseleave="sidebar.onSidebarLeave()"
    >
      <div class="nebula-layout-shell__sidebar-brand">
        <slot name="sidebar-brand" :expanded="sidebarExpanded"></slot>
      </div>
      <nav class="nebula-layout-shell__sidebar-nav" aria-label="主导航">
        <slot name="sidebar" :expanded="sidebarExpanded"></slot>
      </nav>
      <NebulaShellSidebarFooter />
    </aside>

    <div class="nebula-layout-shell__main">
      <NebulaShellHeader
        v-show="!contentFullscreen"
        :breadcrumbs="breadcrumbs"
        :show-breadcrumb="resolvedShowBreadcrumb"
        :show-refresh="!resolvedShowTags || !tags.length"
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
          <slot name="header-actions"></slot>
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
        <slot></slot>
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
    </button>
  </div>
</template>
