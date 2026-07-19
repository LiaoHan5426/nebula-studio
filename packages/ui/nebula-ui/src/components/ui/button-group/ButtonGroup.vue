<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../utils/cn';

defineProps<{
  class?: HTMLAttributes['class'];
  orientation?: 'horizontal' | 'vertical';
}>();
</script>

<template>
  <div
    data-button-group
    :data-orientation="orientation || 'horizontal'"
    :class="
      cn(
        'nebula-button-group inline-flex',
        orientation === 'vertical'
          ? 'flex-col [&>[data-button-group-item]:not(:first-child):not(:last-child)]:rounded-none [&>[data-button-group-item]:first-child:not(:last-child)]:rounded-b-none [&>[data-button-group-item]:last-child:not(:first-child)]:rounded-t-none'
          : '[&>[data-button-group-item]:not(:first-child):not(:last-child)]:rounded-none [&>[data-button-group-item]:first-child:not(:last-child)]:rounded-r-none [&>[data-button-group-item]:last-child:not(:first-child)]:rounded-l-none',
        $attrs.class as string,
      )
    "
    role="group"
  >
    <slot />
  </div>
</template>

<style scoped>
.nebula-button-group {
  gap: 0;
  isolation: isolate;
}

.nebula-button-group :deep([data-button-group-item]) {
  position: relative;
}

.nebula-button-group :deep([data-button-group-item]:focus-visible),
.nebula-button-group :deep([data-button-group-item]:hover) {
  z-index: 1;
}

.nebula-button-group[data-orientation='horizontal']
  :deep([data-button-group-item]:not(:first-child)) {
  margin-left: -1px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.nebula-button-group[data-orientation='horizontal']
  :deep([data-button-group-item]:not(:last-child)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.nebula-button-group[data-orientation='vertical']
  :deep([data-button-group-item]:not(:first-child)) {
  margin-top: -1px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.nebula-button-group[data-orientation='vertical']
  :deep([data-button-group-item]:not(:last-child)) {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
