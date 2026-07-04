<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from 'reka-ui';
import type { ScrollAreaRootProps } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <ScrollAreaRoot
    v-bind="$props"
    :class="cn('relative overflow-hidden', $attrs.class as string)"
  >
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      orientation="vertical"
      class="flex touch-none select-none transition-colors h-full w-2.5 border-l border-l-transparent p-px"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      orientation="horizontal"
      class="flex touch-none select-none transition-colors h-2.5 flex-col border-t border-t-transparent p-px"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
