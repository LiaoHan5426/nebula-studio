<script setup lang="ts">
import { NebulaIconButton } from '@nebula-studio/nebula-ui';
import { computed } from 'vue';

import { useLayoutContext } from '../../composables/useLayoutContext';
import { useLayoutPreferences } from '../../composables/useLayoutPreferences';

const { sidebar } = useLayoutContext();
const { preferences } = useLayoutPreferences();

const sidebarExpanded = computed(() => sidebar.effectiveExpanded.value);

const collapseTitle = computed(() =>
  sidebarExpanded.value ? '收起侧栏' : '展开侧栏',
);

const pinTitle = computed(() => (preferences.pinned ? '取消固定' : '固定侧栏'));
</script>

<template>
  <footer class="nebula-sidebar-footer">
    <NebulaIconButton
      class="nebula-sidebar-footer__btn"
      :title="collapseTitle"
      :aria-label="collapseTitle"
      @click="sidebar.toggleCollapsed()"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="16"
        height="16"
      >
        <template v-if="sidebarExpanded">
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </template>
        <template v-else>
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </template>
      </svg>
    </NebulaIconButton>

    <NebulaIconButton
      :class="
        preferences.pinned
          ? 'nebula-sidebar-footer__btn nebula-sidebar-footer__pin is-pin-active'
          : 'nebula-sidebar-footer__btn nebula-sidebar-footer__pin'
      "
      :active="preferences.pinned"
      :title="pinTitle"
      aria-label="固定侧栏"
      @click="sidebar.togglePinned()"
    >
      <svg
        v-if="preferences.pinned"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="16"
        height="16"
      >
        <path d="M12 17v5" />
        <path d="M9 3h6l1 7h4l-5 8v3H9v-3L5 10h4l1-7z" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="16"
        height="16"
      >
        <path d="M12 17v5" />
        <path d="M9 3h6l1 7h4l-5 8v3H9v-3L5 10h4l1-7z" />
        <line x1="4" y1="4" x2="20" y2="20" />
      </svg>
    </NebulaIconButton>
  </footer>
</template>
