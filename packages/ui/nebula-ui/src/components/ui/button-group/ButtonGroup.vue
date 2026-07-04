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
        'inline-flex',
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
