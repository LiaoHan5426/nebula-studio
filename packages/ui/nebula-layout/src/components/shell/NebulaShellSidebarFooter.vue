<script setup lang="ts">
import { computed } from 'vue';

import { NebulaButton, NebulaIcon } from '@nebula-studio/nebula-ui';

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
    <NebulaButton
      icon
      variant="ghost"
      class="nebula-sidebar-footer__btn"
      :title="collapseTitle"
      :aria-label="collapseTitle"
      @click="sidebar.toggleCollapsed()"
    >
      <NebulaIcon
        :icon="
          sidebarExpanded ? 'lucide:chevrons-left' : 'lucide:chevrons-right'
        "
        :size="16"
      />
    </NebulaButton>

    <NebulaButton
      icon
      variant="ghost"
      :class="
        preferences.pinned
          ? 'nebula-sidebar-footer__btn nebula-sidebar-footer__pin is-pin-active'
          : 'nebula-sidebar-footer__btn nebula-sidebar-footer__pin'
      "
      :active="preferences.pinned"
      :title="pinTitle"
      :aria-label="pinTitle"
      @click="sidebar.togglePinned()"
    >
      <NebulaIcon
        :icon="preferences.pinned ? 'lucide:pin' : 'lucide:pin-off'"
        :size="16"
      />
    </NebulaButton>
  </footer>
</template>
