<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import type { SubNavItem } from '../../types/layout';

const props = defineProps<{
  items: SubNavItem[];
  maxVisible?: number;
}>();

const route = useRoute();
const drawerOpen = ref(false);

const maxVisible = computed(() => props.maxVisible ?? 6);

const visibleItems = computed(() => props.items.slice(0, maxVisible.value));
const overflowItems = computed(() => props.items.slice(maxVisible.value));

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`);
}

function closeDrawer() {
  drawerOpen.value = false;
}
</script>

<template>
  <div class="nebula-admin-subnav">
    <div class="nebula-admin-subnav__tabs" role="tablist">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.key"
        :to="item.to"
        class="nebula-admin-subnav__tab"
        :class="{ 'is-active': isActive(item.to) }"
        role="tab"
      >
        {{ item.label }}
      </RouterLink>

      <button
        v-if="overflowItems.length"
        type="button"
        class="nebula-admin-subnav__more"
        @click="drawerOpen = !drawerOpen"
        :aria-expanded="drawerOpen"
      >
        更多
      </button>
    </div>

    <Transition name="nebula-admin-subnav__drawer">
      <div v-if="drawerOpen" class="nebula-admin-subnav__drawer">
        <div
          class="nebula-admin-subnav__drawer-backdrop"
          @click="closeDrawer"
        />
        <aside class="nebula-admin-subnav__drawer-panel">
          <header class="nebula-admin-subnav__drawer-head">
            <strong>导航</strong>
            <button type="button" @click="closeDrawer">关闭</button>
          </header>
          <RouterLink
            v-for="item in overflowItems"
            :key="item.key"
            :to="item.to"
            class="nebula-admin-subnav__drawer-link"
            @click="closeDrawer"
          >
            {{ item.label }}
          </RouterLink>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nebula-admin-subnav__tabs {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  overflow-x: auto;
}

.nebula-admin-subnav__tab {
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: 8px;
}

.nebula-admin-subnav__tab.is-active {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 65%);
}

.nebula-admin-subnav__more {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.nebula-admin-subnav__drawer {
  position: fixed;
  inset: 0;
  z-index: 8000;
}

.nebula-admin-subnav__drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 35%);
}

.nebula-admin-subnav__drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: min(280px, 88vw);
  height: 100%;
  padding: 12px;
  background: hsl(var(--card));
  box-shadow: -8px 0 24px rgb(0 0 0 / 18%);
}

.nebula-admin-subnav__drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.nebula-admin-subnav__drawer-link {
  padding: 10px 12px;
  color: hsl(var(--foreground));
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.nebula-admin-subnav__drawer-link:hover {
  background: hsl(var(--muted) / 60%);
}

.nebula-admin-subnav__drawer-enter-active,
.nebula-admin-subnav__drawer-leave-active {
  transition: opacity 0.2s ease;
}

.nebula-admin-subnav__drawer-enter-active .nebula-admin-subnav__drawer-panel,
.nebula-admin-subnav__drawer-leave-active .nebula-admin-subnav__drawer-panel {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
}

.nebula-admin-subnav__drawer-enter-from,
.nebula-admin-subnav__drawer-leave-to {
  opacity: 0;
}

.nebula-admin-subnav__drawer-enter-from .nebula-admin-subnav__drawer-panel,
.nebula-admin-subnav__drawer-leave-to .nebula-admin-subnav__drawer-panel {
  opacity: 0;
  transform: translateX(100%);
}
</style>
