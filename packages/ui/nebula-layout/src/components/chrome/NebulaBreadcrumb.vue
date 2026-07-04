<script setup lang="ts">
import type { BreadcrumbSegment } from '../../types/layout';

defineProps<{
  items: BreadcrumbSegment[];
}>();

function iconPath(name: BreadcrumbSegment['icon']): string | null {
  switch (name) {
    case 'home':
      return 'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z';
    case 'integration':
      return 'M4 6h16M4 12h16M4 18h16';
    case 'settings':
      return 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10.5 3.17V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15.32 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z';
    case 'folder':
      return 'M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z';
    case 'file':
      return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M14 2v6h6';
    default:
      return null;
  }
}
</script>

<template>
  <nav class="nebula-breadcrumb" aria-label="当前位置">
    <template
      v-for="(item, index) in items"
      :key="item.key ?? `${item.label}-${index}`"
    >
      <span
        class="nebula-breadcrumb__item"
        :class="{ 'is-current': index === items.length - 1 }"
      >
        <svg
          v-if="item.icon && iconPath(item.icon)"
          class="nebula-breadcrumb__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path :d="iconPath(item.icon)!" />
        </svg>
        <component
          :is="item.to && index < items.length - 1 ? 'a' : 'span'"
          :href="item.to && index < items.length - 1 ? item.to : undefined"
          class="nebula-breadcrumb__label"
        >
          {{ item.label }}
        </component>
      </span>
      <svg
        v-if="index < items.length - 1"
        class="nebula-breadcrumb__sep"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </template>
  </nav>
</template>

<style scoped>
.nebula-breadcrumb {
  display: flex;
  gap: 2px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.nebula-breadcrumb__item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
  padding: 4px 6px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  border-radius: 8px;
}

.nebula-breadcrumb__item.is-current {
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 40%);
}

.nebula-breadcrumb__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  opacity: 0.85;
}

.nebula-breadcrumb__label {
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  white-space: nowrap;
  text-decoration: none;
}

a.nebula-breadcrumb__label:hover {
  color: hsl(var(--primary));
}

.nebula-breadcrumb__sep {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0.45;
}
</style>
