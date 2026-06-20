<script setup lang="ts">
import { computed, toRef } from 'vue';

import {
  createSidebarState,
  provideLayoutContext,
} from '../../composables/useLayoutContext';
import { useLayoutPreferences } from '../../composables/useLayoutPreferences';
import NebulaShellHeader from './NebulaShellHeader.vue';
import NebulaShellSidebarFooter from './NebulaShellSidebarFooter.vue';
import NebulaShellTagsBar from './NebulaShellTagsBar.vue';
import NebulaPreferencesDrawer from '../preferences/NebulaPreferencesDrawer.vue';
import type { BreadcrumbSegment, ShellTagItem } from '../../types/layout';
import type { NebulaThemeMode } from '@nebula-studio/nebula-ui';

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
  tagsFullscreen: [];
}>();

const preferencesOpen = defineModel<boolean>('preferencesOpen', {
  default: false,
});

const { preferences } = useLayoutPreferences();

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
  'nebula-layout-transition': true,
}));

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

const shellStyle = computed(() => ({
  '--shell-top':
    resolvedShowTags.value && (props.tags?.length ?? 0) > 0
      ? 'calc(var(--layout-header-height) + var(--layout-tags-height))'
      : 'var(--layout-header-height)',
}));

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
          @activate="emit('tagActivate', $event)"
          @close="emit('tagClose', $event)"
          @close-left="emit('tagsCloseLeft')"
          @close-right="emit('tagsCloseRight')"
          @close-others="emit('tagsCloseOthers')"
          @close-all="emit('tagsCloseAll')"
          @refresh="emit('tagsRefresh')"
          @fullscreen="emit('tagsFullscreen')"
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
  </div>
</template>
